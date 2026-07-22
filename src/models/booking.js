const db = require("../config/database");
const {
    waitlistUser,
    getWaitlistPosition,
    getWaitlistCount
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

        const total_price =
            (passenger_seats + vehicle_slots) *
            schedule.base_price;

        // ===================================================
        // WAITLIST
        // ===================================================
        if(vehicle_slots > schedule.available_vehicle_slots) {
            throw new Error("Not enough vehicle slots available");
        }

        if (
            passenger_seats > schedule.available_passenger_seats
        ) {

            console.log("🚨 Waitlist condition matched");

            // Find next waitlist number
            const [countRows] = await connection.query(
                `
                SELECT COUNT(*) AS total
                FROM bookings
                WHERE schedule_id = ?
                AND booking_status = 'waiting'
                `,
                [schedule_id]
            );

            const waitlistNumber = countRows[0].total + 1;

            // Save waiting booking in MySQL
            const [result] = await connection.query(
                `
                INSERT INTO bookings
                (
                    user_id,
                    schedule_id,
                    passenger_seats,
                    vehicle_slots,
                    total_price,
                    booking_status,
                    waitlist_number
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    user_id,
                    schedule_id,
                    passenger_seats,
                    vehicle_slots,
                    total_price,
                    "waiting",
                    waitlistNumber
                ]
            );

            // Add booking to Redis queue
            await waitlistUser(
                schedule_id,
                result.insertId
            );

            // Increase waitlist count
            await connection.query(
                `
                UPDATE schedules
                SET waitlist_count = waitlist_count + 1
                WHERE id = ?
                `,
                [schedule_id]
            );

            await connection.commit();

            return {
                waitlisted: true,
                booking_id: result.insertId,
                waitlist_number: waitlistNumber,
                message: `Added to Waitlist. WL${waitlistNumber}`
            };
        }

        // ===================================================
        // CONFIRMED BOOKING
        // ===================================================

        const [result] = await connection.query(
            `
            INSERT INTO bookings
            (
                user_id,
                schedule_id,
                passenger_seats,
                vehicle_slots,
                total_price,
                booking_status,
                waitlist_number,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                schedule_id,
                passenger_seats,
                vehicle_slots,
                total_price,
                "confirmed",
                null,
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
            booking_status: "confirmed"
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

    const [results] = await db.query(
        `
       SELECT
    b.*,
    s.origin,
    s.destination,
    s.departure_time,
    s.arrival_time,
    f.name AS ferry_name
FROM bookings b
JOIN schedules s
    ON b.schedule_id = s.id
JOIN ferries f
    ON s.ferry_id = f.id
WHERE b.user_id = ?
ORDER BY b.id DESC;
        `,
        [userId]
    );

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