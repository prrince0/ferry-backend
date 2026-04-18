const redisClient = require('../config/redis');
const db = require('../config/database');

async function initializeSeatCounters() {
    try {
        const [schedules] = await db.query(`
            SELECT s.id AS schedule_id, f.passenger_capacity 
            FROM schedules s
            JOIN ferries f ON s.ferry_id = f.id
        `);
        
        for (const schedule of schedules) {
            const { schedule_id, passenger_capacity } = schedule;
            await redisClient.set(`schedule:${schedule_id}:available_seats`, passenger_capacity);
            console.log(`Set schedule:${schedule_id}:available_seats = ${passenger_capacity}`);
        }
        
        console.log(`Initialized ${schedules.length} seat counters in Redis`);
        
    } catch (error) {
        console.error('Failed to initialize seat counters:', error);
    }
}

module.exports = initializeSeatCounters;