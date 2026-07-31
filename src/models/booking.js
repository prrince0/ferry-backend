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
        // CONFIRMED BOOKING //
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


// cancel Booking by id

const cancelBooking = async (bookingId) => {
    if (!bookingId) {
        throw new Error("Booking ID is required");
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get booking details
        const [bookingRows] = await connection.query(
            `SELECT * FROM bookings WHERE id = ?`,
            [bookingId]
        );

        if (bookingRows.length === 0) {
            throw new Error("Booking not found");
        }

        const booking = bookingRows[0];
        const scheduleId = booking.schedule_id;

        // Get schedule details
        const [scheduleRows] = await connection.query(
            `SELECT * FROM schedules WHERE id = ?`,
            [scheduleId]
        );

        if (scheduleRows.length === 0) {
            throw new Error("Schedule not found");
        }

        const schedule = scheduleRows[0];

        // Cancel current booking
        console.log("Cancelling booking:", bookingId);
        await connection.query(
            `UPDATE bookings
             SET status='cancelled',
                 booking_status='cancelled'
             WHERE id=?`,
            [bookingId]
        );
        console.log("Booking updated");
        const [rows] = await connection.query(
  `SELECT status, booking_status
   FROM bookings
   WHERE id = ?`,
  [bookingId]
);

console.log("After update:", rows[0]);

        // Check waitlist
        if (schedule.waitlist_count > 0) {

            // Oldest waiting passenger
            const [waitlistRows] = await connection.query(
                `SELECT *
                FROM bookings
                WHERE schedule_id = ?
                AND booking_status='waiting'
                 ORDER BY booking_date ASC
                 LIMIT 1`,
                [scheduleId]
            );

            if (waitlistRows.length > 0) {

                const waitlistedBooking = waitlistRows[0];

                // Confirm passenger
                await connection.query(
                    `UPDATE bookings
                     SET status='confirmed',
                         booking_status='confirmed'
                     WHERE id=?`,
                    [waitlistedBooking.id]
                );

                // Reduce waitlist
                await connection.query(
                    `UPDATE schedules
                     SET waitlist_count = waitlist_count - 1
                     WHERE id=?`,
                    [scheduleId]
                );
            }

        } else {

            // Increase available seat
            await connection.query(
                `UPDATE schedules
                 SET available_passenger_seats =
                     available_passenger_seats + 1
                 WHERE id=?`,
                [scheduleId]
            );
        }

        await connection.commit();

        return {
            success: true,
            message: "Booking cancelled successfully"
        };

    } catch (err) {

        await connection.rollback();
        throw err;

    } finally {

        connection.release();
    }
};


const getBookingsByAdmin = async (adminId) => {

    const [rows] = await db.query(
        `
        SELECT
            b.id,

            u.full_name AS passenger_name,
            u.email,

            f.name AS ferry_name,

            s.origin,
            s.destination,
            s.departure_time,
            s.arrival_time,

            b.passenger_seats,
            b.vehicle_slots,

            b.total_price,

            b.booking_status

        FROM bookings b

        JOIN users u
            ON b.user_id = u.id

        JOIN schedules s
            ON b.schedule_id = s.id

        JOIN ferries f
            ON s.ferry_id = f.id

        WHERE f.created_by = ?

        ORDER BY b.id DESC
        `,
        [adminId]
    );

    return rows;
};
module.exports = { createBooking, getBookingById, getBookingsByUserId, cancelBooking , getBookingsByAdmin};