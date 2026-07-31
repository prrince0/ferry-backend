const db = require("../config/database");
const Booking = require("../models/booking");
const Schedule = require("../models/schedule");
const redisClient = require('../config/upstash');
const getRedisKey = require('../utils/redisKey');  
const { waitlistUser, getWaitlistPosition , getWaitlistCount} = require('../services/waitlistService');

// -------------------- Create Booking --------------------

const createBooking = async (req, res) => {

    console.log("✅ createBooking called");

    try {

        const user_id = req.user.id;

        const {
            schedule_id,
            passenger_seats,
            vehicle_slots
        } = req.body;

        // Validation
        if (!schedule_id) {
            return res.status(400).json({
                success: false,
                message: "Schedule ID is required"
            });
        }

        if (
            passenger_seats === undefined ||
            vehicle_slots === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Passenger seats and vehicle slots are required"
            });
        }

        if (
            passenger_seats < 0 ||
            vehicle_slots < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking quantity"
            });
        }

        if (
            passenger_seats === 0 &&
            vehicle_slots === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Select at least one passenger seat or one vehicle slot"
            });
        }

        // Call Model
        const booking = await Booking.createBooking({
            user_id,
            schedule_id,
            passenger_seats,
            vehicle_slots
        });

        console.log("Booking returned:", booking);

        // ==========================
        // WAITLIST RESPONSE
        // ==========================
        if (booking.waitlisted) {

            return res.status(200).json({
                success: true,
                waitlisted: true,
                booking_id: booking.booking_id,
                waitlist_number: booking.waitlist_number,
                message: booking.message
            });

        }

        // ==========================
        // CONFIRMED BOOKING
        // ==========================

        return res.status(201).json({
            success: true,
            waitlisted: false,
            message: "Booking Successful",
            booking
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// -------------------- Get Booking By ID --------------------

const getBookingById = async (req, res) => {

    try {

        const booking = await Booking.getBookingById(
            req.params.id
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.status(200).json(booking);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

// -------------------- My Bookings --------------------

const getMyBookings = async (req, res) => {

    try {

        const bookings =
            await Booking.getBookingsByUserId(
                req.user.id
            );

        res.status(200).json(bookings);

    } catch (err) {

           console.log("Status:", err.response?.status);
            console.log("Data:", err.response?.data);
            console.log("Full Error:", err);

    alert(err.response?.data?.message || "Failed to load bookings");

    }

};

// -------------------- Get All Bookings (Admin) --------------------

const getAllBookings = async (req, res) => {

    try {

        const bookings =
            await Booking.getAllBookings();

        res.status(200).json(bookings);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

// -------------------- Cancel Booking --------------------

const cancelBooking = async (req, res) => {

    try {

        const booking =
            await Booking.cancelBooking(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message:
                "Booking cancelled successfully",
            booking
        });

    } catch (err) {

        console.error("CANCEL ERROR:", err);
    res.status(500).json({
        message: err.message,
    });

    }

};

const getAdminBookings = async (req, res) => {

    try {

        const bookings = await Booking.getBookingsByAdmin(req.user.id);

        res.json(bookings);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};

module.exports = {

    createBooking,

    getBookingById,

    getMyBookings,

    getAllBookings,

    cancelBooking,

    getAdminBookings

};