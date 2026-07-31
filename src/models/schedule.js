const db = require("../config/database");
const {
    waitlistUser,
    getWaitlistPosition,
    getWaitlistCount
} = require("../services/waitlistService");


const createSchedule = async (scheduleData) => {
  const {
    ferry_id,
    origin,
    destination,
    departure_time,
    arrival_time,
    base_price,
    available_passenger_seats,
    available_vehicle_slots,
  } = scheduleData;

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
    throw new Error("All fields are required");
  }

  if (base_price <= 0) {
    throw new Error("Base price must be greater than 0");
  }

  if (available_passenger_seats < 0 || available_vehicle_slots < 0) {
    throw new Error("Available seats cannot be negative");
  }

  if (new Date(departure_time) >= new Date(arrival_time)) {
    throw new Error("Departure time must be before arrival time");
  }

  const [ferry] = await db.query(
    "SELECT id FROM ferries WHERE id = ?",
    [ferry_id]
  );

  if (ferry.length === 0) {
    throw new Error("Ferry not found");
  }

  const query = `
    INSERT INTO schedules
    (
      ferry_id,
      origin,
      destination,
      departure_time,
      arrival_time,
      base_price,
      available_passenger_seats,
      available_vehicle_slots
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(query, [
    ferry_id,
    origin,
    destination,
    departure_time,
    arrival_time,
    base_price,
    available_passenger_seats,
    available_vehicle_slots,
  ]);

  return {
    id: result.insertId,
    ferry_id,
    origin,
    destination,
    departure_time,
    arrival_time,
    base_price,
    available_passenger_seats,
    available_vehicle_slots,
  };
};

// ================= UPDATE SCHEDULE =================
const updateSchedule = async (scheduleId, scheduleData) => {
  const {
    ferry_id,
    origin,
    destination,
    departure_time,
    arrival_time,
    base_price,
    status
  } = scheduleData;

  if (
  ferry_id === "" ||
  origin.trim() === "" ||
  destination.trim() === "" ||
  departure_time === "" ||
  arrival_time === "" ||
  base_price === ""
) {
  throw new Error("All fields are required");
}

  if (base_price <= 0) {
    throw new Error("Base price must be greater than 0");
  }

  if (new Date(departure_time) >= new Date(arrival_time)) {
    throw new Error("Arrival time must be after departure time");
  }

  const query = `
    UPDATE schedules
    SET
      ferry_id = ?,
      origin = ?,
      destination = ?,
      departure_time = ?,
      arrival_time = ?,
      base_price = ?,
      status = ?
    WHERE id = ?
  `;

  const [result] = await db.query(query, [
    ferry_id,
    origin,
    destination,
    departure_time,
    arrival_time,
    base_price,
    status,
    scheduleId,
  ]);

  if (result.affectedRows === 0) {
    throw new Error("Schedule not found");
  }

  const [updated] = await db.query(
    "SELECT * FROM schedules WHERE id = ?",
    [scheduleId]
  );

  return updated[0];
};

// ================= DELETE SCHEDULE =================
const deleteSchedule = async (scheduleId) => {
  const [result] = await db.query(
    "DELETE FROM schedules WHERE id = ?",
    [scheduleId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Schedule not found");
  }
};

// ================= FIND BY ID =================
const findScheduleById = async (scheduleId) => {
  const [result] = await db.query(
    `
    SELECT
      s.*,
      f.name AS ferry_name,
      f.image_url
    FROM schedules s
    JOIN ferries f
      ON s.ferry_id = f.id
    WHERE s.id = ?
    `,
    [scheduleId]
  );

  if (result.length === 0) {
    throw new Error("Schedule not found");
  }

  return result[0];
};

// ================= FIND ALL =================
const findAllSchedules = async () => {
  try{
   const [result] = await db.query(`
    SELECT
      s.*,
      f.name AS ferry_name,
       f.image_url
    FROM schedules s
    JOIN ferries f
      ON s.ferry_id = f.id
    ORDER BY s.departure_time ASC
  `);
    
  return result;
  }catch (err) {
    console.error("findAllSchedules Error:", err);
    throw err;
  }
  
};

module.exports = {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  findScheduleById,
  findAllSchedules,
};