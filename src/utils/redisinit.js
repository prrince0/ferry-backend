const redisClient = require('../config/upstash');
const db = require('../config/database');
const getRedisKey = require('./redisKey');

async function initializeSeatCounters() {
    try {
        const [schedules] = await db.query(`
            SELECT s.id AS schedule_id, f.passenger_capacity 
            FROM schedules s
            JOIN ferries f ON s.ferry_id = f.id
        `);
        for (const schedule of schedules) {
            const key = getRedisKey(`schedule:${schedule.schedule_id}:available_seats`);
            await redisClient.set(key, schedule.passenger_capacity);
            console.log(`Set ${key} = ${schedule.passenger_capacity}`);
        }
        console.log(`Initialized ${schedules.length} seat counters`);
    } catch (error) {
        console.error('Failed to initialize seat counters:', error);
    }
}
module.exports = initializeSeatCounters;