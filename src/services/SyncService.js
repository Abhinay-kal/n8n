const WordPressClient = require('./WordPressClient');

class SyncService {
    constructor({ siteService, wordpressRepository, logger }) {
        this.siteService = siteService;
        this.wordpressRepository = wordpressRepository;
        this.logger = logger;
    }

    async testConnection(siteId) {
        const credentials = await this.siteService.getDecryptedCredentials(siteId);
        if (!credentials || !credentials.wpUrl || !credentials.wpUsername || !credentials.wpApplicationPassword) {
            throw new Error('WordPress credentials not configured or incomplete');
        }

        const client = new WordPressClient({
            url: credentials.wpUrl,
            username: credentials.wpUsername,
            applicationPassword: credentials.wpApplicationPassword,
            logger: this.logger
        });

        return client.testConnection();
    }

    async syncSite(siteId) {
        const syncId = await this.wordpressRepository.startSyncRun(siteId);
        let itemsCreated = 0;
        let itemsUpdated = 0;
        let itemsProcessed = 0;

        try {
            const credentials = await this.siteService.getDecryptedCredentials(siteId);
            const client = new WordPressClient({
                url: credentials.wpUrl,
                username: credentials.wpUsername,
                applicationPassword: credentials.wpApplicationPassword,
                logger: this.logger
            });

            // 1. Sync Taxonomy (Authors, Categories, Tags)
            await this._syncTaxonomy(siteId, client);

            // 2. Sync Posts (Paginated)
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const { posts, totalPages } = await client.getPosts({ page });
                
                for (const wpPost of posts) {
                    itemsProcessed++;
                    const existing = await this.wordpressRepository.getPostByWpId(siteId, wpPost.id);
                    
                    const postData = {
                        wp_post_id: wpPost.id,
                        title: wpPost.title.rendered,
                        slug: wpPost.slug,
                        status: wpPost.status,
                        modified: wpPost.modified_gmt + 'Z',
                        content: wpPost.content.rendered,
                        excerpt: wpPost.excerpt.rendered,
                        author_id: await this._getAuthorLocalId(siteId, wpPost.author)
                    };

                    const updated = await this.wordpressRepository.upsertPost(siteId, postData);
                    if (existing) {
                        itemsUpdated++;
                    } else {
                        itemsCreated++;
                    }
                }

                if (page >= totalPages) {
                    hasMore = false;
                } else {
                    page++;
                }

                // Update progress in sync run
                await this.wordpressRepository.updateSyncRun(syncId, {
                    items_processed: itemsProcessed,
                    items_created: itemsCreated,
                    items_updated: itemsUpdated
                });
            }

            await this.wordpressRepository.updateSyncRun(syncId, {
                status: 'COMPLETED',
                finished_at: new Date().toISOString()
            });

            this.logger.info({ 
                event: 'SYNC_COMPLETED', 
                site_id: siteId, 
                items_created: itemsCreated, 
                items_updated: itemsUpdated 
            });

            return { success: true, itemsCreated, itemsUpdated };

        } catch (error) {
            this.logger.error({ event: 'SYNC_FAILED', site_id: siteId, error: error.message });
            await this.wordpressRepository.updateSyncRun(syncId, {
                status: 'FAILED',
                finished_at: new Date().toISOString(),
                errors: error.message
            });
            throw error;
        }
    }

    async _syncTaxonomy(siteId, client) {
        // Sync Authors
        const authors = await client.getAuthors();
        for (const author of authors) {
            await this.wordpressRepository.upsertAuthor(siteId, author.id, author.name);
        }

        // Sync Categories
        const categories = await client.getCategories();
        for (const cat of categories) {
            await this.wordpressRepository.upsertCategory(siteId, cat.id, cat.name, cat.slug);
        }

        // Sync Tags
        const tags = await client.getTags();
        for (const tag of tags) {
            await this.wordpressRepository.upsertTag(siteId, tag.id, tag.name, tag.slug);
        }
    }

    async _getAuthorLocalId(siteId, wpAuthorId) {
        const authors = await this.wordpressRepository.getAuthorsBySiteId(siteId);
        const author = authors.find(a => a.wp_author_id === wpAuthorId);
        return author ? author.id : null;
    }
}

module.exports = SyncService;
