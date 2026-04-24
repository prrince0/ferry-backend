const { Redis } = require('@upstash/redis');
require('dotenv').config();

const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Optional: test connection (but no .on)
(async () => {
    try {
        await redisClient.ping();
        console.log(' Redis connected (Upstash REST)');
    } catch (err) {
        console.error(' Redis connection failed:', err.message);
    }
})();

module.exports = redisClient;