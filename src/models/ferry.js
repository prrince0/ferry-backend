const db = require("../config/database");

//  CREATE FERRY
const createFerry = async (ferryData, req) => {
    const {
        name,
        vehicle_capacity,
        passenger_capacity,
        image_url,
        amenities,
    } = ferryData;

    // Logged-in admin ID
    const created_by = req.user.id;

    // Validation
    if (!name) {
        throw new Error("Ferry name is required");
    }

    if (!passenger_capacity || passenger_capacity <= 0) {
        throw new Error("Passenger capacity must be greater than 0");
    }

    if (vehicle_capacity && vehicle_capacity < 0) {
        throw new Error("Vehicle capacity cannot be negative");
    }

    const vehicleCap = vehicle_capacity ?? 0;
    const amenitiesJson = amenities
        ? JSON.stringify(amenities)
        : null;

    const query = `
        INSERT INTO ferries
        (
            name,
            vehicle_capacity,
            passenger_capacity,
            image_url,
            amenities,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
        name,
        vehicleCap,
        passenger_capacity,
        image_url,
        amenitiesJson,
        created_by,
    ]);

    return {
        id: result.insertId,
        name,
        vehicle_capacity: vehicleCap,
        passenger_capacity,
        image_url,
        amenities,
        created_by,
    };
};

// GET MY FERRY
const getMyFerries = async (adminId) => {
  const query = `
    SELECT id, name
    FROM ferries
    WHERE created_by = ?
    ORDER BY name
  `;

  const [rows] = await db.query(query, [adminId]);

  return rows;
};

//  GET BY ID
const getFerryById = async (id) => {
    const query = "SELECT * FROM ferries WHERE id = ?";
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) return null;

    const ferry = rows[0];

    //  Convert JSON string → object
    ferry.amenities = ferry.amenities ? JSON.parse(ferry.amenities) : null;

    return ferry;
};

//  GET ALL
const allFerries = async () => {
    const query = "SELECT * FROM ferries";
    const [rows] = await db.query(query);

    //  Convert JSON for each ferry
    return rows.map(ferry => ({
        ...ferry,
        amenities: ferry.amenities ? JSON.parse(ferry.amenities) : null
    }));
};

// UPDATE
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

    //  If no row updated
    if (result.affectedRows === 0) {
        return null;
    }

    // ✅ Return updated ferry
    return await getFerryById(id);
};

//  DELETE
const deleteFerry = async (id) => {
    const query = "DELETE FROM ferries WHERE id = ?";
    const [result] = await db.query(query, [id]);

    return result; // contains affectedRows
};

module.exports = {
    createFerry,
    getFerryById,
    getMyFerries,
    allFerries,
    updateFerry,
    deleteFerry
};