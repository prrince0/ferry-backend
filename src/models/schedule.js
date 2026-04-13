const db = require("../config/database");

// create schedule
const createSchedule = async(scheduleData) => {
  const { ferry_id, origin, destination, departure_time, arrival_time, base_price } = scheduleData;
  if(!ferry_id || !origin || !destination || !departure_time || !arrival_time || !base_price) {
    throw new Error("All fields are required");
  }
  if(base_price <= 0) {
    throw new Error("Base price must be greater than 0");
  }
  if(new Date(departure_time) >= new Date(arrival_time)) {
    throw new Error("Departure time must be before arrival time");
  }
  const [ferry] = await db.query("SELECT id FROM ferries WHERE id = ?", [ferry_id]);
  if (ferry.length === 0) throw new Error("Ferry not found");

  const query =`INSERT INTO schedules (ferry_id, origin, destination, departure_time, arrival_time, base_price) VALUES (?, ?, ?, ?, ?, ?)`;
  const [result] = await db.query(query, [ferry_id, origin, destination, departure_time, arrival_time, base_price]);
  return {
    id: result.insertId,
    ferry_id,
    origin,
    destination,
    departure_time,
    arrival_time,
    base_price
  };
};

// update scheduale
const updateSchedule = async(scheduleId, scheduleData) => {     
  const { ferry_id, origin, destination, departure_time, arrival_time, base_price } = scheduleData;
  if (!ferry_id || !origin || !destination || !departure_time || !arrival_time || !base_price) {
    throw new Error("All fields are required");
}

 if (base_price <= 0) throw new Error("Base price must be greater than 0");

 if (new Date(departure_time) >= new Date(arrival_time)) {
    throw new Error("Arrival time must be after departure time");
}
    const query = `
        UPDATE schedules
        SET ferry_id = ?, origin = ?, destination = ?, departure_time = ?, arrival_time = ?, base_price = ?
        WHERE id = ?
    `;
    const [result] = await db.query(query, [ferry_id, origin, destination, departure_time, arrival_time, base_price, scheduleId]);
    if (result.affectedRows === 0) {
        throw new Error("Schedule not found");
    }
    const [updated] = await db.query("SELECT * FROM schedules WHERE id = ?", [scheduleId]);
    return updated[0];
};

// delete scheduale
const deleteSchedule = async(scheduleId) => {
    const query = "DELETE FROM schedules WHERE id = ?";
    const [result] = await db.query(query, [scheduleId]);
    if (result.affectedRows === 0) {
        throw new Error("Schedule not found");
    }
};

// find schedule by id

const findScheduleById = async(scheduleId) => {
   const query = "SELECT * FROM schedules WHERE id = ?";
   const [result] = await db.query(query, [scheduleId]);
    if (result.length === 0) {
        throw new Error("Schedule not found");
    }
    return result[0]; 
};

const findAllSchedules = async() => {
    const query = "SELECT * FROM schedules";
    const [result] = await db.query(query);
    return result;
};




module.exports = {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  findScheduleById,
  findAllSchedules
};

