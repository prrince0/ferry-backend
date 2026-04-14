const db = require("../config/database");

const createBooking = async (bookingData) => {
    const { user_id, schedule_id, seat_number, total_price, status } = bookingData;
    
    if (!user_id || !schedule_id || !seat_number || !total_price) {
        throw new Error("Missing required booking data");
    }
    
    const query = `
        INSERT INTO bookings (user_id, schedule_id, seat_number, total_price, status)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [user_id, schedule_id, seat_number, total_price, status || 'confirmed'];
    const [result] = await db.query(query, values);
    
    return {
        id: result.insertId,
        user_id,
        schedule_id,
        seat_number,
        total_price,
        status: status || 'confirmed'
    };
};

const getBookingById = async (bookingId) => {
    if (!bookingId) {
        throw new Error("Booking ID is required");
    }
    const query = `SELECT * FROM bookings WHERE id = ?`;
    const [results] = await db.query(query, [bookingId]);
    return results[0] || null;
};

const getBookingsByUserId = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required");
    }
    const query = `SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC`;
    const [results] = await db.query(query, [userId]);
    return results;
};

const cancelBooking = async (bookingId) => {
    if (!bookingId) {
        throw new Error("Booking ID is required");
    }
    const query = `UPDATE bookings SET status = 'cancelled' WHERE id = ?`;
    const [result] = await db.query(query, [bookingId]);
    return result;
};

module.exports = { createBooking, getBookingById, getBookingsByUserId, cancelBooking };