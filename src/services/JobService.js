const { PROJECT_STATUSES } = require('../models/ContentProject');

class JobService {
    constructor({ jobRepository, projectRepository, siteRepository, logger }) {
        this.jobRepository = jobRepository;
        this.projectRepository = projectRepository;
        this.siteRepository = siteRepository;
        this.logger = logger;
    }

    async createJob({ siteId, wpPostId, prompt = null, type = 'REWRITE', priority = 'NORMAL' }) {
        try {
            // 1. Fetch site settings to snapshot prompts
            const settings = await this.siteRepository.getSiteSettings(siteId);
            const auditPromptSnapshot = settings ? settings.audit_prompt : null;
            const rewritePromptSnapshot = settings ? settings.rewrite_prompt : null;

            // 2. Ensure Content Project exists
            let project = null;
            if (wpPostId) {
                project = await this.projectRepository.getProjectByWpPostId(siteId, wpPostId);
                if (!project) {
                    project = await this.projectRepository.createProject(siteId, wpPostId);
                    this.logger.info({ event: 'PROJECT_CREATED', site_id: siteId, project_id: project.id, wp_post_id: wpPostId });
                }

                // Update Project Status based on Job Type
                const nextStatus = type === 'AUDIT' ? PROJECT_STATUSES.AUDIT_PENDING : PROJECT_STATUSES.REWRITE_PENDING;
                await this.projectRepository.updateStatus(project.id, nextStatus);
            }

            // 3. Create the Job
            const job = await this.jobRepository.createJob({
                siteId,
                projectId: project ? project.id : null,
                type,
                priority,
                prompt,
                auditPromptSnapshot,
                rewritePromptSnapshot
            });
            
            this.logger.info({ event: 'JOB_CREATED', site_id: siteId, project_id: project ? project.id : null, job_id: job.id });
            return job;
        } catch (error) {
            this.logger.error({ event: 'JOB_CREATE_FAILED', site_id: siteId, wp_post_id: wpPostId, error: error.message });
            throw error;
        }
    }

    async getJobById(id) {
        return this.jobRepository.getJobById(id);
    }

    async getJobsBySiteId(siteId) {
        return this.jobRepository.getJobsBySiteId(siteId);
    }

    async getPendingJobs() {
        return this.jobRepository.getPendingJobs();
    }

    async getQueueSummary() {
        return this.jobRepository.getQueueSummary();
    }

    async getQueueStats() {
        return this.jobRepository.getQueueStats();
    }

    async getSiteQueue(siteId) {
        return this.jobRepository.getSiteQueue(siteId);
    }

    async startJob(id) {
        const job = await this.jobRepository.markProcessing(id);
        this.logger.info({ event: 'JOB_STARTED', wp_post_id: job.wp_post_id, job_id: job.id });
        return job;
    }

    async completeJob(id) {
        const job = await this.jobRepository.markCompleted(id);
        this.logger.info({ event: 'JOB_COMPLETED', wp_post_id: job.wp_post_id, job_id: job.id });
        return job;
    }

    async failJob(id, error) {
        const job = await this.jobRepository.markFailed(id, error);
        this.logger.error({ event: 'JOB_FAILED', wp_post_id: job.wp_post_id, job_id: job.id, error });
        return job;
    }

    async recoverInterruptedJobs() {
        try {
            const count = await this.jobRepository.recoverProcessingJobs();
            if (count > 0) {
                this.logger.info({ event: 'JOB_RECOVERED', count });
            }
            return count;
        } catch (error) {
            this.logger.error({ event: 'JOB_RECOVERY_FAILED', error: error.message });
            throw error;
        }
    }
}

module.exports = JobService;
