const express = require('express');

function createWordPressRoutes({ syncService, wordpressRepository, logger }) {
    const router = express.Router();

    // POST /sites/:id/wordpress/test - Test WP connection
    router.post('/sites/:id/wordpress/test', async (req, res) => {
        try {
            const result = await syncService.testConnection(req.params.id);
            return res.json({ success: true, ...result });
        } catch (error) {
            logger.error({ event: 'WP_CONNECTION_TEST_ERROR', site_id: req.params.id, error: error.message });
            return res.status(400).json({ success: false, error: error.message });
        }
    });

    // POST /sites/:id/sync - Trigger content sync
    router.post('/sites/:id/sync', async (req, res) => {
        try {
            // Trigger sync in background or wait? Requirement says POST /sites/:id/sync
            // Usually sync can take time, but for now we wait for simplicity or until Queue refactor
            const result = await syncService.syncSite(req.params.id);
            return res.json({ success: true, ...result });
        } catch (error) {
            logger.error({ event: 'WP_SYNC_ROUTE_ERROR', site_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /sites/:id/posts - List synced posts
    router.get('/sites/:id/posts', async (req, res) => {
        try {
            const posts = await wordpressRepository.getPostsBySiteId(req.params.id);
            return res.json({ success: true, posts });
        } catch (error) {
            logger.error({ event: 'WP_POSTS_GET_ERROR', site_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /sites/:id/posts/:postId - Get specific post
    router.get('/sites/:id/posts/:postId', async (req, res) => {
        try {
            const post = await wordpressRepository.getPostByWpId(req.params.id, req.params.postId);
            if (!post) {
                return res.status(404).json({ success: false, error: 'Post not found' });
            }
            return res.json({ success: true, post });
        } catch (error) {
            logger.error({ event: 'WP_POST_GET_ERROR', site_id: req.params.id, post_id: req.params.postId, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /sites/:id/categories - List synced categories
    router.get('/sites/:id/categories', async (req, res) => {
        try {
            const categories = await wordpressRepository.getCategoriesBySiteId(req.params.id);
            return res.json({ success: true, categories });
        } catch (error) {
            logger.error({ event: 'WP_CATEGORIES_GET_ERROR', site_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /sites/:id/tags - List synced tags
    router.get('/sites/:id/tags', async (req, res) => {
        try {
            const tags = await wordpressRepository.getTagsBySiteId(req.params.id);
            return res.json({ success: true, tags });
        } catch (error) {
            logger.error({ event: 'WP_TAGS_GET_ERROR', site_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    // GET /sites/:id/authors - List synced authors
    router.get('/sites/:id/authors', async (req, res) => {
        try {
            const authors = await wordpressRepository.getAuthorsBySiteId(req.params.id);
            return res.json({ success: true, authors });
        } catch (error) {
            logger.error({ event: 'WP_AUTHORS_GET_ERROR', site_id: req.params.id, error: error.message });
            return res.status(500).json({ success: false, error: 'Internal error' });
        }
    });

    return router;
}

module.exports = { createWordPressRoutes };
