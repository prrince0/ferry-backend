const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authmiddleware");

// Dashboard Charts
router.get("/bookingtrend", protect, dashboardController.getBookingTrend);

router.get("/revenueferry", protect, dashboardController.getRevenueByFerry);

router.get("/bookingstatus", protect, dashboardController.getBookingStatus);

router.get("/passengersroute", protect, dashboardController.getPassengersByRoute);

module.exports = router;