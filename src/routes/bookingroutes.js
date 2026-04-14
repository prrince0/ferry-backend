const bookingController = require("../controllers/bookingController");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");

router.post("/", protect, bookingController.createBooking);
router.get("/:id", protect, bookingController.getBookingById);
router.get("/user/my-bookings", protect, bookingController.getMyBookings);  // Changed
router.delete("/:id", protect, bookingController.cancelBooking);

module.exports = router;