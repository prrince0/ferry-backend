const getRedisKey = (key) => {
    const prefix = process.env.REDIS_PREFIX || 'dev';
    return `${prefix}:${key}`;
};

module.exports = getRedisKey;