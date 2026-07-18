const db = require("../config/database");
const {
    waitlistUser,
    getWaitlistPosition
} = require("../services/waitlistService");

const createBooking = async (bookingData) => {
    const {
        user_id,
        schedule_id,
        passenger_seats,
        vehicle_slots,
        status
    } = bookingData;

    if (!user_id || !schedule_id) {
        throw new Error("Missing required booking data");
    }

    if (passenger_seats < 0 || vehicle_slots < 0) {
        throw new Error("Invalid booking quantity");
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // Lock schedule row
        const [scheduleRows] = await connection.query(
            `
            SELECT *
            FROM schedules
            WHERE id = ?
            FOR UPDATE
            `,
            [schedule_id]
        );

        if (scheduleRows.length === 0) {
            throw new Error("Schedule not found");
        }

        const schedule = scheduleRows[0];

        console.log("Requested Passenger:", passenger_seats);
       console.log("Available Passenger:", schedule.available_passenger_seats);

      console.log("Requested Vehicle:", vehicle_slots);
      console.log("Available Vehicle:", schedule.available_vehicle_slots);

        // Not enough seats -> add to waitlist
        // Not enough seats -> Add to waitlist
if (
    passenger_seats > schedule.available_passenger_seats ||
    vehicle_slots > schedule.available_vehicle_slots
) {

    console.log("🚨 Waitlist condition matched");

    await waitlistUser(schedule_id, user_id);

    const position = await getWaitlistPosition(
        schedule_id,
        user_id
    );

    await connection.rollback();   // No booking is created, so rollback the transaction

    return {
        waitlisted: true,
        position,
        message: `No seats available. Added to waitlist. Position: ${position}`
    };
}
        // Calculate total price
        const total_price =
            (passenger_seats + vehicle_slots) *
            schedule.base_price;

        // Create booking
        const [result] = await connection.query(
            `
            INSERT INTO bookings
            (
                user_id,
                schedule_id,
                passenger_seats,
                vehicle_slots,
                total_price,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                schedule_id,
                passenger_seats,
                vehicle_slots,
                total_price,
                status || "confirmed"
            ]
        );

        // Reduce available seats
        await connection.query(
            `
            UPDATE schedules
            SET
                available_passenger_seats =
                    available_passenger_seats - ?,

                available_vehicle_slots =
                    available_vehicle_slots - ?

            WHERE id = ?
            `,
            [
                passenger_seats,
                vehicle_slots,
                schedule_id
            ]
        );

        await connection.commit();

        return {
            id: result.insertId,
            user_id,
            schedule_id,
            passenger_seats,
            vehicle_slots,
            total_price,
            status: status || "confirmed"
        };

    } catch (err) {

        await connection.rollback();
        throw err;

    } finally {

        connection.release();

    }
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