function createRateLimiter(options) {
    const { windowMs, maxRequests } = options;
    const store = new Map();

    // Cleanup interval to prevent memory leak
    setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of store.entries()) {
            if (now > data.resetTime) {
                store.delete(ip);
            }
        }
    }, windowMs).unref?.();

    return (req, res, next) => {
        // Trust proxy could be needed if behind a load balancer, but ip is standard
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        
        let data = store.get(ip);
        if (!data || now > data.resetTime) {
            data = { count: 0, resetTime: now + windowMs };
            store.set(ip, data);
        }

        data.count += 1;

        if (data.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too Many Requests'
            });
        }

        next();
    };
}

module.exports = { createRateLimiter };
