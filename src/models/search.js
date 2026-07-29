const db = require("../config/database");

const searchSchedules = async({ origin,
    destination,
    date}) => {
        const query = `
SELECT
    s.*,
    f.name AS ferry_name
FROM schedules s
JOIN ferries f
ON s.ferry_id = f.id
WHERE
    LOWER(s.origin) LIKE LOWER(?)
    AND LOWER(s.destination) LIKE LOWER(?)
    AND DATE(s.departure_time) = ?
    AND s.status='scheduled'
ORDER BY s.departure_time ASC
`;

const [rows] = await db.query(query, [
    `%${origin}%`,
    `%${destination}%`,
    date
]);
    return rows;
    }


    module.exports = {
        searchSchedules
    };