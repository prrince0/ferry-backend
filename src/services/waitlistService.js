const redisClient = require('../config/redis');
const getRedisKey = require('../utils/redisKey');
const db = require('../config/database');

// Add user to waitlist
const waitlistUser = async (scheduleId, userId) => {
  
  const key = getRedisKey(`waitlist:${scheduleId}`);

  const result = await redisClient.zadd(key, {
    score: Date.now(),
    member: userId.toString(),
  });

  console.log("zadd result:", result);
  

};

// Get user's waitlist position
const getWaitlistPosition = async (scheduleId, userId) => {
  const key = getRedisKey(`waitlist:${scheduleId}`);

  const position = await redisClient.zrank(
    key,
    userId.toString()
  );

  console.log("Raw position:", position);

  return position !== null ? Number(position) + 1 : null;
};
// Promote next user
const promoteNextInWaitlist = async (scheduleId) => {
  const key = getRedisKey(`waitlist:${scheduleId}`);

  const users = await redisClient.zrange(key, 0, 0);

  if (users.length === 0) {
    return null;
  }

  const nextUser = users[0];

  await redisClient.zrem(key, nextUser);

  return parseInt(nextUser);
};

// Count users in waitlist
const getWaitlistCount = async (scheduleId) => {
  const key = getRedisKey(`waitlist:${scheduleId}`);

  return await redisClient.zcard(key);
};

module.exports = {
  waitlistUser,
  getWaitlistPosition,
  promoteNextInWaitlist,
  getWaitlistCount,
};