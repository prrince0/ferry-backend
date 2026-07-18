const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { protect } = require("../middleware/authmiddleware");

// Create booking
router.post("/", protect, bookingController.createBooking);

// Logged-in user's bookings
router.get("/my-bookings", protect, bookingController.getMyBookings);

// Booking details
router.get("/:id", protect, bookingController.getBookingById);

// Cancel booking
router.delete("/:id", protect, bookingController.cancelBooking);

module.exports = router;