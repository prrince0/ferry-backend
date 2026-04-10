
const db = require("./database");  

const createFerry = async (ferryData) => {
    const { name, vehicle_capacity, passenger_capacity, image_url, amenities } = ferryData;
    
    // Validation
    if (!name) {
        throw new Error("Ferry name is required");
    }
    
    if (!passenger_capacity || passenger_capacity <= 0) {
        throw new Error("Passenger capacity must be greater than 0");
    }
    
    // Set defaults
    const vehicleCap = vehicle_capacity || 0;
    if (vehicle_capacity && vehicle_capacity < 0) {
    throw new Error("Vehicle capacity cannot be negative");
}
    const amenitiesJson = amenities || {};
    
    // Query
    const query = "INSERT INTO ferries (name, vehicle_capacity, passenger_capacity, image_url, amenities) VALUES (?, ?, ?, ?, ?)";
    
    // Execute (no callback)
    const [result] = await db.query(query, [name, vehicleCap, passenger_capacity, image_url, amenitiesJson]);
    
    // Return the created ferry
    return {
        id: result.insertId,
        name,
        vehicle_capacity: vehicleCap,
        passenger_capacity,
        image_url,
        amenities: amenitiesJson
    };
};
//get a ferry by id
const getFerryById = async (id) => {
const query = "SELECT * FROM ferries WHERE id = ?";
const [rows] = await db.query(query, [id]);

return rows.length > 0 ? rows[0] : null;    

};

// get all ferries

const allFerries = async () => {
    const query = "SELECT * FROM ferries";
    const [rows] = await db.query(query);
    return rows;
};
   // update ferry
const updateFerry = async (id, ferryData) => {
    const { name, vehicle_capacity, passenger_capacity, image_url, amenities } = ferryData;
    const query = "UPDATE ferries SET name = ?, vehicle_capacity = ?, passenger_capacity = ?, image_url = ?, amenities = ? WHERE id = ?";
    const amenitiesJson = amenities || {};
    await db.query(query, [name, vehicle_capacity, passenger_capacity, image_url, amenitiesJson, id]);
    return getFerryById(id);
};

// delete ferry

const deleteFerry = async (id) => {
    const query = "DELETE FROM ferries WHERE id = ?";
    await db.query(query, [id]);
    return { message: "Ferry deleted successfully" };
};

module.exports = { createFerry, getFerryById, allFerries, updateFerry, deleteFerry };