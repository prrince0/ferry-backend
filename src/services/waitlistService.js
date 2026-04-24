const redisClient = require('../config/redisClient');
const db = require('../config/database');

//addToWaitlist(scheduleId, userId)
const waitlistUser = async (scheduleId, userId) => {
await redisClient.zadd(`waitlist:${scheduleId}`, Date.now(), userId);
}

//getPosition(scheduleId, userId)
const getWaitlistPosition = async (scheduleId, userId) => {
    const position = await redisClient.zrank(`waitlist:${scheduleId}`, userId);
    return position !== null ? position + 1 : null; // Convert to 1-based index
}

//promoteNext(scheduleId)
const promoteNextInWaitlist = async (scheduleId) => {
    const nextUserId = await redisClient.zrange(`waitlist:${scheduleId}`, 0, 0);
    if (nextUserId.length > 0) {
        await redisClient.zrem(`waitlist:${scheduleId}`, nextUserId[0]);
        return nextUserId[0];
    }
    return null;
}

//getWaitlistCount(scheduleId)
const getWaitlistCount = async (scheduleId) => {
    const count = await redisClient.zcard(`waitlist:${scheduleId}`);
    return count;
}

module.exports = { waitlistUser, getWaitlistPosition, promoteNextInWaitlist, getWaitlistCount };