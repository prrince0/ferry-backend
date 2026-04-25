const db = require("../config/database");
const Booking = require("../models/booking");
const Schedule = require("../models/schedule");
const redisClient = require('../config/upstash');
const getRedisKey = require('../utils/redisKey');  
const { waitlistUser, getWaitlistPosition } = require('../services/waitlistService');

const isSeatAvailable = async (scheduleId, seatNumber) => {
    if (!scheduleId || !seatNumber) {
        throw new Error("Schedule ID and seat number are required");
    }
    
    // 1. Check Redis for available seats count (using prefixed key)
    const seatsKey = getRedisKey(`schedule:${scheduleId}:available_seats`);
    const availableSeats = await redisClient.get(seatsKey);
    
    if (!availableSeats || parseInt(availableSeats) <= 0) {
        throw new Error("No seats available on this sailing");
    }
    
    // 2. Check if specific seat is already booked (MySQL)
    const query = "SELECT COUNT(*) as count FROM bookings WHERE schedule_id = ? AND seat_number = ? AND status = 'confirmed'";
    const [rows] = await db.query(query, [scheduleId, seatNumber]);
    
    return rows[0].count === 0;
};

// ------------------- Create Booking -------------------
const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { schedule_id, seat_number } = req.body;
        
        if (!schedule_id || !seat_number) {
            return res.status(400).json({ error: "Schedule ID and seat number are required" });
        }
        
        // Check availability (throws error if not available)
        const available = await isSeatAvailable(schedule_id, seat_number);
       if (!available) {
    // Add user to waitlist
    await waitlistUser(schedule_id, userId);
    const position = await getWaitlistPosition(schedule_id, userId);
    return res.status(200).json({
        message: "No seats available. You have been added to the waitlist.",
        waitlisted: true,
        position: position
    });
}
        
        // Get schedule details for price
        const schedule = await Schedule.findScheduleById(schedule_id);
        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }
        
        // Prepare booking data
        const bookingData = {
            user_id: userId,
            schedule_id: schedule_id,
            seat_number: seat_number,
            total_price: schedule.base_price,
            status: "confirmed"
        };
        
        // Create booking in MySQL
        const newBooking = await Booking.createBooking(bookingData);
        
        // Decrease Redis seat counter (with prefix)
        const decrKey = getRedisKey(`schedule:${schedule_id}:available_seats`);
        await redisClient.decr(decrKey);
        
        res.status(201).json(newBooking);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ------------------- Get Booking by ID -------------------
const getBookingById = async (req, res) => {
    const { id } = req.params;  
    
    if (!id) {
        return res.status(400).json({ error: "Booking ID is required" });
    }
    
    try {
        const bookingData = await Booking.getBookingById(id);  
        if (!bookingData) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ------------------- Get My Bookings -------------------
const getMyBookings = async (req, res) => {
    const userId = req.user.id;  
    
    try {
        const bookings = await Booking.getBookingsByUserId(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ------------------- Cancel Booking -------------------
const cancelBooking = async (req, res) => {
    const { id } = req.params;  
    
    if (!id) {
        return res.status(400).json({ error: "Booking ID is required" });
    }
    
    try {
        // First, get the booking to find schedule_id
        const [booking] = await db.query(
            "SELECT schedule_id, seat_number FROM bookings WHERE id = ?",
            [id]
        );
        
        if (booking.length === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        const schedule_id = booking[0].schedule_id;
        const freedSeat = booking[0].seat_number;
        
        // Cancel the booking in MySQL
        const result = await Booking.cancelBooking(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        // Increase Redis seat counter
        const incrKey = getRedisKey(`schedule:${schedule_id}:available_seats`);
        await redisClient.incr(incrKey);
        
        // Promote next user from waitlist
        const promotedUserId = await promoteNextInWaitlist(schedule_id);
        if (promotedUserId) {
            const schedule = await Schedule.findScheduleById(schedule_id);
            const bookingData = {
                user_id: promotedUserId,
                schedule_id: schedule_id,
                seat_number: freedSeat,
                total_price: schedule.base_price,
                status: "confirmed"
            };
            await Booking.createBooking(bookingData);
            console.log(`✅ User ${promotedUserId} auto-booked for schedule ${schedule_id}, seat ${freedSeat}`);
        }
        
        res.status(200).json({ message: "Booking cancelled successfully" });
        
    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
};

module.exports = { createBooking, getBookingById, getMyBookings, cancelBooking };