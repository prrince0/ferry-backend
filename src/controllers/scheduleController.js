const Schedule = require("../models/schedule");

// ================= CREATE SCHEDULE =================

const createSchedule = async (req, res) => {
    const {
        ferry_id,
        origin,
        destination,
        departure_time,
        arrival_time,
        base_price,
        available_passenger_seats,
        available_vehicle_slots
    } = req.body;

    if (
        !ferry_id ||
        !origin ||
        !destination ||
        !departure_time ||
        !arrival_time ||
        !base_price ||
        available_passenger_seats == null ||
        available_vehicle_slots == null
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {

        const scheduleData = {
            ferry_id,
            origin,
            destination,
            departure_time,
            arrival_time,
            base_price,
            available_passenger_seats,
            available_vehicle_slots
        };

        const schedule = await Schedule.createSchedule(scheduleData);

        return res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            schedule
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ================= UPDATE SCHEDULE =================

const updateSchedule = async (req, res) => {

    const { id } = req.params;

    const {
        ferry_id,
        origin,
        destination,
        departure_time,
        arrival_time,
        base_price,
        status
        
    } = req.body;

    if (
        !ferry_id ||
        !origin ||
        !destination ||
        !departure_time ||
        !arrival_time ||
        !base_price 
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {

        const updatedSchedule = await Schedule.updateSchedule(id, {
            ferry_id,
            origin,
            destination,
            departure_time,
            arrival_time,
            base_price,
            status
        });

        return res.status(200).json({
            success: true,
            message: "Schedule updated successfully",
            schedule: updatedSchedule
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ================= DELETE SCHEDULE =================

const deleteSchedule = async (req, res) => {

    const { id } = req.params;

    try {

        await Schedule.deleteSchedule(id);

        return res.status(200).json({
            success: true,
            message: "Schedule deleted successfully"
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ================= FIND SCHEDULE BY ID =================

const findScheduleById = async (req, res) => {

    const { id } = req.params;

    try {

        const schedule = await Schedule.findScheduleById(id);

        return res.status(200).json(schedule);

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// ================= FIND ALL SCHEDULES =================

const findAllSchedules = async (req, res) => {

    try {

        const schedules = await Schedule.findAllSchedules();

        return res.status(200).json(schedules);

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
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