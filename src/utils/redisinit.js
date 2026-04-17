const redisClient = require('../config/redis');
const db = require('../config/database');

async function initializeSeatCounters() {
    try {
        const [schedules] = await db.query('SELECT id, passenger_capacity FROM ferries');
    
            let n = schedules.length;
           for (const schedule of schedules) {
          const { id, passenger_capacity } = schedule;
           await redisClient.set(`schedule:${id}:available_seats`, passenger_capacity);
     }   
            console.log(`Initialized ${schedules.length} seat counters in Redis`);

    } catch (error) {
        console.error('Failed to initialize seat counters:', error);
    }
}

module.exports = initializeSeatCounters;