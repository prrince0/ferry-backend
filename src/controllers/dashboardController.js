const dashboard = require("../models/dashboard");

// Booking Trend
const getBookingTrend = async (req, res) => {
  try {
    const result = await dashboard.getBookingTrend();

    res.status(200).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// Revenue by Ferry
const getRevenueByFerry = async (req, res) => {
  try {
    const result = await dashboard.getRevenueByFerry();

    res.status(200).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// Booking Status
const getBookingStatus = async (req, res) => {
  try {
    const result = await dashboard.getBookingStatus();

    res.status(200).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// Passengers by Route
const getPassengersByRoute = async (req, res) => {
  try {
    const result = await dashboard.getPassengersByRoute();

    res.status(200).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getBookingTrend,
  getRevenueByFerry,
  getBookingStatus,
  getPassengersByRoute,
};