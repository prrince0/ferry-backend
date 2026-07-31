const db = require("../config/database");

//getBookingTrend()

const  getBookingTrend = async () =>  {
  const query = `
    SELECT
DATE(booking_date) AS booking_day,
COUNT(*) AS total_bookings
FROM bookings
GROUP BY DATE(booking_date)
ORDER BY booking_day ASC
  `;
    const [rows] = await db.query(query);
    return rows;
};

// getRevenueByFerry()

const getRevenueByFerry = async () => {
  const query = `
    SELECT
f.name,
SUM(b.total_price) AS revenue
FROM bookings b
JOIN schedules s
ON b.schedule_id=s.id
JOIN ferries f
ON s.ferry_id=f.id
GROUP BY f.id
ORDER BY revenue DESC
  `;
  const [rows] = await db.query(query);
  return rows;
};

// getBookingStatus()

const getBookingStatus = async () => {
  const query = `
    SELECT
booking_status,
COUNT(*) AS total
FROM bookings
GROUP BY booking_status
  `;
  const [rows] = await db.query(query);
  return rows;
};

// getPassengersByRoute()

const getPassengersByRoute = async () => {
    const query = `SELECT
CONCAT(origin,' → ',destination) AS route,
SUM(passenger_seats) AS passengers
FROM bookings b
JOIN schedules s
ON b.schedule_id=s.id
GROUP BY route
ORDER BY passengers DESC`;
    const [rows] = await db.query(query);
    return rows;
}

module.exports = {
  getBookingTrend,
  getRevenueByFerry,
  getBookingStatus,
  getPassengersByRoute
};