const Schedule = require("../models/schedule");

// create schedule

const createSchedule = async (req, res) => {
    const { ferry_id, origin, destination, departure_time, arrival_time, base_price } = req.body;
    
    if (!ferry_id || !origin || !destination || !departure_time || !arrival_time || !base_price) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    
    if (base_price <= 0) {
        return res.status(400).json({
            message: "Base price must be greater than 0"
        });
    }
    
    if (new Date(departure_time) >= new Date(arrival_time)) {
        return res.status(400).json({
            message: "Departure time must be before arrival time"
        });
    }
    
    try {
        const scheduleData = { ferry_id, origin, destination, departure_time, arrival_time, base_price };
        const result = await Schedule.createSchedule(scheduleData);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({
            message: err.message || "Error creating schedule"
        });
    }
};
//update schedule

const updateSchedule = async (req, res) => {
    const { id } = req.params;
    const { ferry_id, origin, destination, departure_time, arrival_time, base_price } = req.body;
    if (!ferry_id || !origin || !destination || !departure_time || !arrival_time || !base_price) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }   
    if (base_price <= 0) {
        return res.status(400).json({
            message: "Base price must be greater than 0"
        });
    }
    if (new Date(departure_time) >= new Date(arrival_time)) {
        return res.status(400).json({
            message: "Arrival time must be after departure time"
        });
    }   
    try {
        const updatedSchedule = await schedule.updateSchedule(id, {
            ferry_id,
            origin,
            destination,
            departure_time,
            arrival_time,
            base_price
        });
        return res.status(200).json({
            message: "Schedule updated successfully",
            schedule: updatedSchedule
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Error updating schedule"
        });
    }   
};

// delete schedule
const deleteSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        await schedule.deleteSchedule(id);
        return res.status(200).json({
            message: "Schedule deleted successfully"
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Error deleting schedule"
        });
    }
};

// find schedule by id

const findScheduleById = async (req, res) => {
    const { id } = req.params;
    try {
        const schedule = await Schedule.findScheduleById(id);
        return res.status(200).json(schedule);
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Error finding schedule"
        });
    }
};

// find all schedules
const findAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.findAllSchedules();
        return res.status(200).json(schedules);
    }
    catch (err) {
        return res.status(500).json({
            message: err.message || "Error finding schedules"
        });
    }
};


 module.exports = {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    findScheduleById,
    findAllSchedules
};

    