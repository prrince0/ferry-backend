const redisClient = require('../config/redis');
const getRedisKey = require('../utils/redisKey');
const db = require('../config/database');

//addToWaitlist(scheduleId, userId)
const waitlistUser = async (scheduleId, userId) => {
const key = getRedisKey(`waitlist:${scheduleId}`);
await redisClient.zadd(key, Date.now(), userId);
}

//getPosition(scheduleId, userId)
const getWaitlistPosition = async (scheduleId, userId) => {
    const position = await redisClient.zrank(getRedisKey(`waitlist:${scheduleId}`), userId);
    return position !== null ? position + 1 : null; 
}

//promoteNext(scheduleId)
const promoteNextInWaitlist = async (scheduleId) => {
    const nextUserId = await redisClient.zrange(getRedisKey(`waitlist:${scheduleId}`), 0, 0);
    if (nextUserId.length > 0) {
        await redisClient.zrem(getRedisKey(`waitlist:${scheduleId}`), nextUserId[0]);
        return nextUserId[0];
    }
    return null;
}

//getWaitlistCount(scheduleId)
const getWaitlistCount = async (scheduleId) => {
    const count = await redisClient.zcard(getRedisKey(`waitlist:${scheduleId}`));
    return count;
}

module.exports = { waitlistUser, getWaitlistPosition, promoteNextInWaitlist, getWaitlistCount };