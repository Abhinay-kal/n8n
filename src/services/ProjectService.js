const { PROJECT_STATUSES } = require('../models/ContentProject');
const AuditParser = require('../utils/AuditParser');
const DiffTracker = require('../utils/DiffTracker');

class ProjectService {
    constructor({ projectRepository, jobRepository, eventRepository, wordpressRepository, logger }) {
        this.projectRepository = projectRepository;
        this.jobRepository = jobRepository;
        this.eventRepository = eventRepository;
        this.wordpressRepository = wordpressRepository;
        this.logger = logger;
    }

    async getProjectDetails(id) {
        try {
            const project = await this.projectRepository.getProjectById(id);
            if (!project) return null;

            const [jobs, versions, audits, rewrites] = await Promise.all([
                this.jobRepository.getJobsByProjectId(id),
                this.projectRepository.getVersionsByProjectId(id),
                this.projectRepository.getAuditsByProjectId(id),
                this.projectRepository.getRewritesByProjectId(id)
            ]);

            return {
                project,
                jobs,
                versions,
                audits,
                rewrites
            };
        } catch (error) {
            this.logger.error({ event: 'PROJECT_DETAILS_FETCH_ERROR', project_id: id, error: error.message });
            throw error;
        }
    }

    async updateProjectStatus(id, status) {
        try {
            const project = await this.projectRepository.updateStatus(id, status);
            this.logger.info({ event: 'PROJECT_STATUS_UPDATED', project_id: id, status });
            
            // Record Project Event: STATE_CHANGED
            await this.recordEvent({
                project_id: id,
                event_type: 'STATE_CHANGED',
                message: `Project status changed to ${status}`,
                metadata: { status }
            });

            return project;
        } catch (error) {
            this.logger.error({ event: 'PROJECT_STATUS_UPDATE_FAILED', project_id: id, status, error: error.message });
            throw error;
        }
    }

    async recordEvent({ project_id, event_type, message = null, metadata = null }) {
        try {
            return await this.eventRepository.createEvent({ project_id, event_type, message, metadata });
        } catch (error) {
            this.logger.warn({ event: 'PROJECT_EVENT_RECORD_FAILED', project_id, error: error.message });
        }
    }

    async getPostByProjectId(projectId) {
        const project = await this.projectRepository.getProjectById(projectId);
        if (!project) throw new Error('Project not found');
        return this.wordpressRepository.getPostByWpId(project.siteId, project.wpPostId);
    }

    async getLatestAuditByProjectId(projectId) {
        const audits = await this.projectRepository.getAuditsByProjectId(projectId);
        return audits.length > 0 ? audits[0] : null;
    }

    async completeAudit(projectId, rawResponse) {
        try {
            const project = await this.projectRepository.getProjectById(projectId);
            if (!project) throw new Error('Project not found');

            const post = await this.getPostByProjectId(projectId);
            if (!post) throw new Error('Post not found');

            // Ensure Version 1 (ORIGINAL) exists
            const versions = await this.projectRepository.getVersionsByProjectId(projectId);
            if (versions.length === 0) {
                await this.projectRepository.createVersion(projectId, project.siteId, 1, 'ORIGINAL', post.content);
                this.logger.info({ event: 'VERSION_CREATED', project_id: projectId, version: 1, type: 'ORIGINAL' });
            }

            const parsed = AuditParser.parse(rawResponse);
            
            const audit = await this.projectRepository.createAudit({
                siteId: project.siteId,
                projectId: project.id,
                result: rawResponse,
                score: parsed.score,
                metadata: parsed.metadata
            });

            await this.updateProjectStatus(projectId, PROJECT_STATUSES.AUDIT_COMPLETE);
            
            this.logger.info({ event: 'AUDIT_COMPLETED', project_id: projectId, audit_id: audit.id });
            return audit;
        } catch (error) {
            this.logger.error({ event: 'AUDIT_COMPLETION_FAILED', project_id: projectId, error: error.message });
            throw error;
        }
    }

    async completeRewrite(projectId, auditId, optimizedContent) {
        try {
            const project = await this.projectRepository.getProjectById(projectId);
            if (!project) throw new Error('Project not found');

            const originalPost = await this.getPostByProjectId(projectId);
            if (!originalPost) throw new Error('Original post not found');

            // Calculate metrics
            const metrics = DiffTracker.calculate(originalPost.content, optimizedContent);
            const metadata = {
                ...metrics,
                auditVersion: auditId
            };

            const rewrite = await this.projectRepository.createRewrite({
                siteId: project.siteId,
                projectId: project.id,
                auditId,
                optimizedContent,
                metadata
            });

            // Create New Content Version
            const versions = await this.projectRepository.getVersionsByProjectId(projectId);
            const nextVersionNumber = versions.length + 1;
            await this.projectRepository.createVersion(projectId, project.siteId, nextVersionNumber, 'REWRITE', optimizedContent);

            await this.updateProjectStatus(projectId, PROJECT_STATUSES.REWRITE_COMPLETE);
            
            this.logger.info({ event: 'REWRITE_COMPLETED', project_id: projectId, rewrite_id: rewrite.id, version: nextVersionNumber });
            return rewrite;
        } catch (error) {
            this.logger.error({ event: 'REWRITE_COMPLETION_FAILED', project_id: projectId, error: error.message });
            throw error;
        }
    }

    /**
     * Reconciles project states after recovery.
     * Projects in active states (AUDITING, REWRITING) with PENDING jobs
     * should be reverted to their PENDING states.
     */
    async reconcileProjectStates() {
        try {
            const auditingProjects = await this.projectRepository.getProjectsByStatus(PROJECT_STATUSES.AUDITING);
            const rewritingProjects = await this.projectRepository.getProjectsByStatus(PROJECT_STATUSES.REWRITING);
            
            let reconciledCount = 0;

            for (const project of auditingProjects) {
                const jobs = await this.jobRepository.getJobsByProjectId(project.id);
                const hasPendingAudit = jobs.some(j => j.type === 'AUDIT' && j.status === 'PENDING');
                if (hasPendingAudit) {
                    await this.projectRepository.updateStatus(project.id, PROJECT_STATUSES.AUDIT_PENDING);
                    reconciledCount++;
                }
            }

            for (const project of rewritingProjects) {
                const jobs = await this.jobRepository.getJobsByProjectId(project.id);
                const hasPendingRewrite = jobs.some(j => j.type === 'REWRITE' && j.status === 'PENDING');
                if (hasPendingRewrite) {
                    await this.projectRepository.updateStatus(project.id, PROJECT_STATUSES.REWRITE_PENDING);
                    reconciledCount++;
                }
            }

            if (reconciledCount > 0) {
                this.logger.info({ event: 'PROJECT_RECONCILIATION_COMPLETE', count: reconciledCount });
            }
            return reconciledCount;
        } catch (error) {
            this.logger.error({ event: 'PROJECT_RECONCILIATION_FAILED', error: error.message });
            throw error;
        }
    }

    async getProjectHistory(id) {
        try {
            return await this.eventRepository.getEventsByProjectId(id);
        } catch (error) {
            this.logger.error({ event: 'PROJECT_HISTORY_FETCH_ERROR', project_id: id, error: error.message });
            throw error;
        }
    }
}

module.exports = { ProjectService };
