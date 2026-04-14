const booking = require("../models/booking");

const isSeatAvailable = async (scheduleId, seatNumber) => {
    const {scheduleId, seatNumber} = req.body;
    if(!scheduleId || !seatNumber) {
        return res.status(400).json({ error: "Schedule ID and seat number are required" });
    }
    if(seatNumber<=0){
        return res.status(400).json({ error: "Seat number must be greater than 0" });
    }
    const query = `SELECT COUNT(*) AS bookedSeats FROM bookings WHERE schedule_id = ? AND seat_number = ?`;
    db.query(query, [scheduleId, seatNumber], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        const bookedSeats = results[0].bookedSeats;
        const {total_Seats} = await schedule.findScheduleById(scheduleId);
        if (bookedSeats + seats > totalSeats) {
            return res.status(400).json({ error: "Not enough seats available" });
        }
        res.status(200).json({ message: "Seats are available" });
    });
};

const createBooking = async (req, res) => {
    const{userId, ferryId, date, time, seats} = req.body;
    if(!userId || !ferryId || !date || !time || !seats) {
        return res.status(400).json({ error: "Missing required booking data" });
    }
    try {
        const newBooking = await booking.Booking({ userId, ferryId, date, time, seats });
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const calculatePrice =  (req,res,next) => {
    const{ScheduleId, seats} = req.body;
    if(!ScheduleId || !seats) {
        return res.status(400).json({error:"Missing required fields"});
    }
    
    const {scheduleId,} = req.params;
    const query = `SELECT base_price FROM schedules WHERE id = ?`;
    return base_price;

    const totalPrice = base_price * seats;
    const query2 = `INSERT INTO bookings (user_id, schedule_id, seat_number, total_price) VALUES (?, ?, ?, ?)`;  
    req.body.totalPrice = totalPrice;
    next();
;}

const getBookingByID = async(req,res) => {
    const{BookingId} = req.params;
    if(!BookingId){
        return res.status(400).json({error:"Booking ID is required"});
    }
    try {
        const bookinData = await booking.getBookinngById(BookingId);
        if(!bookinData) {
            return res.status(404).json({error:"Booking not found"});
        }        res.status(200).json(bookinData);
    }
 catch (error) {
        res.status(500).json({error:error.message});
    }   
};
const getBookingsByUserId = async(req,res) => {
    const{userId} = req.params;
    if(!userId){
        return res.status(400).json({error:"User ID is required"});
    }
    try {
        const bookings = await booking.getBookingsByUserId(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
};

const cancelBooking = async(req,res)=>{
    const{BookingId} = req.params;
    if(!BookingId){
        return res.status(400).json({error:"Booking ID is reqired"});
    }
    try{
        const result = await booking.cancelBooking(BookingId);
        if(result.affectedRows === 0) {
            return res.status(404).json({error:"Booking not found"});
        }
        res.status(200).json({message:"Booking cancelled successfully"});
    } catch (error) {
        res.status(500).json({error:error.kmessage});
    }
};

module.exports = {createBooking, getBookingByID, getBookingsByUserId, cancelBooking};