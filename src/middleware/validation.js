function validateRewriteRequest(req, res, next) {
    const { prompt, wp_post_id } = req.body;

    if (prompt === undefined || prompt === null) {
        return res.status(400).json({ success: false, error: 'Missing prompt' });
    }

    if (typeof prompt !== 'string') {
        return res.status(400).json({ success: false, error: 'Prompt must be a string' });
    }

    if (prompt.trim() === '') {
        return res.status(400).json({ success: false, error: 'Prompt cannot be empty' });
    }

    if (wp_post_id !== undefined && wp_post_id !== null) {
        if (typeof wp_post_id !== 'number' && typeof wp_post_id !== 'string') {
            return res.status(400).json({ success: false, error: 'wp_post_id must be a number or string' });
        }
    }
    
    // Prevent payload abuse
    if (req.body && typeof req.body === 'object') {
        const keys = Object.keys(req.body);
        if (keys.length > 10) {
            return res.status(400).json({ success: false, error: 'Too many fields in payload' });
        }
    }

    next();
}

module.exports = { validateRewriteRequest };
