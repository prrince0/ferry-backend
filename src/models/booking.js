const db = require("../config/database");


const Booking = async (bookingData) => {
  const { userId, ferryId, date, time, seats } = bookingData;
  if (!userId || !ferryId || !date || !time || !seats) {
    throw new Error("Missing required booking data");
  }
  const query = `
    INSERT INTO bookings (user_id, ferry_id, date, time, seats)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [userId, ferryId, date, time, seats];
  const [results] = await db.query(query, values);
  return results;
};


//getBookingById

const getBookingById = async(bookingId) => {
    const query = `SELECT * FROM bookings WHERE id = ?`;
    if(!bookingId) {
        throw new Error("Booking ID is required");
    }
    const [results] = await db.query(query, [bookingId]);
    return results[0];
};

const getBookingsByUserId = async(userId) => {
    const query = `SELECT * FROM bookings WHERE user_id = ?`;
    if(!userId) {
        throw new Error("User ID is required");
    }
    const [results] = await db.query(query, [userId]);
    return results;
}

const cancelBooking = async(bookingId) => {
    const query = `DELETE FDROM bookings WHERE id =?`;
    if(!bookingId) {
        throw new Error("Booking ID is required");
    }
    const [results] = await db.query(query, [bookingId]);
    return results;
};


module.exports = { Booking, getBookingById, getBookingsByUserId, cancelBooking };