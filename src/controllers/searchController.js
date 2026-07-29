const db = require("../config/database");

const Schedule = require("../models/search");

const searchSchedules = async (req, res) => {
    console.log("Query:", req.query);

    try {
        const { origin, destination, date } = req.query;

        const schedules = await Schedule.searchSchedules({
            origin,
            destination,
            date
        });

        console.log("Schedules:", schedules);

        res.status(200).json(schedules);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};


module.exports = {
    searchSchedules
};