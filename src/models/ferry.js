const db = require("../config/database");

// ✅ CREATE FERRY
const createFerry = async (ferryData) => {
    const { name, vehicle_capacity, passenger_capacity, image_url, amenities } = ferryData;

    // 🔐 Validation
    if (!name) {
        throw new Error("Ferry name is required");
    }

    if (!passenger_capacity || passenger_capacity <= 0) {
        throw new Error("Passenger capacity must be greater than 0");
    }

    if (vehicle_capacity && vehicle_capacity < 0) {
        throw new Error("Vehicle capacity cannot be negative");
    }

    // ✅ Defaults
    const vehicleCap = vehicle_capacity ?? 0;
    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;

    // 🧾 Query
    const query = `
        INSERT INTO ferries (name, vehicle_capacity, passenger_capacity, image_url, amenities)
        VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
        name,
        vehicleCap,
        passenger_capacity,
        image_url,
        amenitiesJson
    ]);

    // ✅ Return created ferry
    return {
        id: result.insertId,
        name,
        vehicle_capacity: vehicleCap,
        passenger_capacity,
        image_url,
        amenities
    };
};

// ✅ GET BY ID
const getFerryById = async (id) => {
    const query = "SELECT * FROM ferries WHERE id = ?";
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) return null;

    const ferry = rows[0];

    // 🔄 Convert JSON string → object
    ferry.amenities = ferry.amenities ? JSON.parse(ferry.amenities) : null;

    return ferry;
};

// ✅ GET ALL
const allFerries = async () => {
    const query = "SELECT * FROM ferries";
    const [rows] = await db.query(query);

    // 🔄 Convert JSON for each ferry
    return rows.map(ferry => ({
        ...ferry,
        amenities: ferry.amenities ? JSON.parse(ferry.amenities) : null
    }));
};

// ✅ UPDATE
const updateFerry = async (id, ferryData) => {
    const { name, vehicle_capacity, passenger_capacity, image_url, amenities } = ferryData;

    const amenitiesJson = amenities ? JSON.stringify(amenities) : null;

    const query = `
        UPDATE ferries 
        SET name = ?, vehicle_capacity = ?, passenger_capacity = ?, image_url = ?, amenities = ?
        WHERE id = ?
    `;

    const [result] = await db.query(query, [
        name,
        vehicle_capacity,
        passenger_capacity,
        image_url,
        amenitiesJson,
        id
    ]);

    // ❌ If no row updated
    if (result.affectedRows === 0) {
        return null;
    }

    // ✅ Return updated ferry
    return await getFerryById(id);
};

// ✅ DELETE
const deleteFerry = async (id) => {
    const query = "DELETE FROM ferries WHERE id = ?";
    const [result] = await db.query(query, [id]);

    return result; // contains affectedRows
};

module.exports = {
    createFerry,
    getFerryById,
    allFerries,
    updateFerry,
    deleteFerry
};