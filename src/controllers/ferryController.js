const ferry = require('../models/ferry');

//  CREATE
const createFerry = async (req, res) => {
    const { name, vehicle_capacity, passenger_capacity, image_url, amenities } = req.body;

    if (!name || !vehicle_capacity || !passenger_capacity) {
        return res.status(400).json({
            message: "Name, vehicle capacity and passenger capacity are required"
        });
    }

    if (vehicle_capacity <= 0 || passenger_capacity <= 0) {
        return res.status(400).json({
            message: "Capacities must be greater than 0"
        });
    }

    try {
        const result = await ferry.createFerry({
            name,
            vehicle_capacity,
            passenger_capacity,
            image_url,
            amenities
        });

        return res.status(201).json({
            message: "New ferry created successfully",
            ferry: result
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message || "Error creating ferry"
        });
    }
};

//  UPDATE
const updateFerry = async (req, res) => {
    const { id } = req.params;
    const { name, vehicle_capacity, passenger_capacity, image_url, amenities } = req.body;

    if (!id) {
        return res.status(400).json({
            message: "Ferry ID is required"
        });
    }

    if (!name && !vehicle_capacity && !passenger_capacity && !image_url && !amenities) {
        return res.status(400).json({
            message: "At least one field is required to update"
        });
    }

    if (
        (vehicle_capacity && vehicle_capacity <= 0) ||
        (passenger_capacity && passenger_capacity <= 0)
    ) {
        return res.status(400).json({
            message: "Capacities must be greater than 0"
        });
    }

    try {
        const result = await ferry.updateFerry(id, {
            name,
            vehicle_capacity,
            passenger_capacity,
            image_url,
            amenities
        });

        if (!result) {
            return res.status(404).json({
                message: "Ferry not found"
            });
        }

        return res.status(200).json({
            message: "Ferry updated successfully",
            ferry: result
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error updating ferry"
        });
    }
};

//  DELETE
const deleteFerry = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Ferry ID is required"
        });
    }

    try {
        const result = await ferry.deleteFerry(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Ferry not found"
            });
        }

        return res.status(200).json({
            message: "Ferry deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error deleting ferry"
        });
    }
};

//  GET BY ID
const getFerryById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Ferry ID is required"
        });
    }

    try {
        const result = await ferry.getFerryById(id);

        if (!result) {
            return res.status(404).json({
                message: "Ferry not found"
            });
        }

        return res.status(200).json({
            message: "Ferry retrieved successfully",
            ferry: result
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error retrieving ferry"
        });
    }
};

//  GET ALL
const getAllFerries = async (req, res) => {
    try {
        const result = await ferry.allFerries();

        return res.status(200).json({
            message: "Ferries retrieved successfully",
            ferries: result
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error retrieving ferries"
        });
    }
};

module.exports = {
    createFerry,
    updateFerry,
    deleteFerry,
    getFerryById,
    getAllFerries
};