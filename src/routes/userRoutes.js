const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/authmiddleware");

router.get("/profile", protect, userController.getProfile);

module.exports = router;