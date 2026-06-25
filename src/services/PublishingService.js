const { PROJECT_STATUSES } = require('../models/ContentProject');
const WordPressClient = require('./WordPressClient');

class PublishingService {
    constructor({ siteService, projectService, publishingRepository, eventRepository, logger }) {
        this.siteService = siteService;
        this.projectService = projectService;
        this.publishingRepository = publishingRepository;
        this.eventRepository = eventRepository;
        this.logger = logger;
    }

    async publishToWordPress(projectId, { rewriteId, mode = 'DRAFT' }) {
        try {
            const project = await this.projectService.projectRepository.getProjectById(projectId);
            if (!project) throw new Error('Project not found');

            const rewrite = await this.projectService.projectRepository.getRewriteById(rewriteId);
            if (!rewrite) throw new Error('Rewrite not found');

            const credentials = await this.siteService.getDecryptedCredentials(project.siteId);
            const client = new WordPressClient({
                url: credentials.wpUrl,
                username: credentials.wpUsername,
                applicationPassword: credentials.wpApplicationPassword,
                logger: this.logger
            });

            const contentData = {
                content: rewrite.optimized_content
            };

            let wpResult;
            let status;

            if (mode === 'PENDING_REVIEW') {
                wpResult = await client.createPendingReview(project.wpPostId, contentData);
                status = 'PENDING_REVIEW';
            } else {
                wpResult = await client.updateDraft(project.wpPostId, contentData);
                status = 'DRAFT_CREATED';
            }

            const publishedDraft = await this.publishingRepository.createPublishedDraft({
                siteId: project.siteId,
                projectId: project.id,
                rewriteId,
                wpPostId: project.wpPostId,
                wpDraftId: wpResult.id,
                publishMode: mode,
                status
            });

            // Update Project State
            const nextProjectStatus = status === 'PENDING_REVIEW' ? PROJECT_STATUSES.READY_FOR_EDITOR : PROJECT_STATUSES.DRAFT_CREATED;
            await this.projectService.updateProjectStatus(projectId, nextProjectStatus);

            await this.eventRepository.createEvent({
                project_id: projectId,
                event_type: status === 'PENDING_REVIEW' ? 'PENDING_REVIEW_CREATED' : 'DRAFT_CREATED',
                message: `Content ${status === 'PENDING_REVIEW' ? 'submitted for review' : 'saved as draft'} in WordPress`,
                metadata: { wp_post_id: project.wpPostId, wp_draft_id: wpResult.id, mode }
            });

            this.logger.info({ event: 'PUBLISH_SUCCESS', project_id: projectId, status, wp_draft_id: wpResult.id });
            return publishedDraft;

        } catch (error) {
            this.logger.error({ event: 'PUBLISH_FAILED', project_id: projectId, error: error.message });
            
            await this.eventRepository.createEvent({
                project_id: projectId,
                event_type: 'PUBLISH_FAILED',
                message: `Failed to publish to WordPress: ${error.message}`,
                metadata: { mode, error: error.message }
            });

            throw error;
        }
    }

    async getPublishingHistory(projectId) {
        return this.publishingRepository.getPublishedDraftsByProjectId(projectId);
    }
}

module.exports = PublishingService;
