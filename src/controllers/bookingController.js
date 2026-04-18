const db = require("../config/database");
const Booking = require("../models/booking");
const Schedule = require("../models/schedule");
const redisClient = require('../config/redis');

const isSeatAvailable = async (scheduleId, seatNumber) => {
    if (!scheduleId || !seatNumber) {
        throw new Error("Schedule ID and seat number are required");
    }
    
    // 1. Check Redis for available seats count
    const availableSeats = await redisClient.get(`schedule:${scheduleId}:available_seats`);
    
    if (!availableSeats || parseInt(availableSeats) <= 0) {
        throw new Error("No seats available on this sailing");
    }
    
    // 2. Check if specific seat is already booked (MySQL)
    const query = "SELECT COUNT(*) as count FROM bookings WHERE schedule_id = ? AND seat_number = ? AND status = 'confirmed'";
    const [rows] = await db.query(query, [scheduleId, seatNumber]);
    
    return rows[0].count === 0;
};

const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { schedule_id, seat_number } = req.body;
        
        if (!schedule_id || !seat_number) {
            return res.status(400).json({ error: "Schedule ID and seat number are required" });
        }
        
        const available = await isSeatAvailable(schedule_id, seat_number);
        if (!available) {
            return res.status(400).json({ error: "Seat already booked" });
        }
        
        const schedule = await Schedule.findScheduleById(schedule_id);
        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }
        
    
        const bookingData = {
            user_id: userId,
            schedule_id: schedule_id,
            seat_number: seat_number,
            total_price: schedule.base_price,
            status: "confirmed"
        };
        
        const newBooking = await Booking.createBooking(bookingData);
        // Decrease Redis counter
      await redisClient.decr(`schedule:${schedule_id}:available_seats`);
        res.status(201).json(newBooking);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

const getMyBookings = async (req, res) => {
    const userId = req.user.id;  
    
    try {
        const bookings = await Booking.getBookingsByUserId(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;  
    
    if (!id) {
        return res.status(400).json({ error: "Booking ID is required" });
    }
    
    try {
        // First, get the booking to find schedule_id
        const [booking] = await db.query(
            "SELECT schedule_id FROM bookings WHERE id = ?",
            [id]
        );
        
        if (booking.length === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        const schedule_id = booking[0].schedule_id;
        
        // Then cancel the booking (only once)
        const result = await Booking.cancelBooking(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        // Increase Redis counter
        await redisClient.incr(`schedule:${schedule_id}:available_seats`);
        
        res.status(200).json({ message: "Booking cancelled successfully" });
        
    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
};

module.exports = { createBooking, getBookingById, getMyBookings, cancelBooking };