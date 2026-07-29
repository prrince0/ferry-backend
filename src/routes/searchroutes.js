const express = require("express");
const router = express.Router();
 const searchController = require("../controllers/searchController");

// Search schedules  
    router.get("/search", searchController.searchSchedules);

    module.exports = router;