const express = require("express");
const path = require("path");
const dotenv = require("dotenv");


dotenv.config();

const app = express();
const cors = require("cors");
const passport = require("./src/config/passport");
const routes = require("./src/routes/authroutes");
const ferryRoutes = require("./src/routes/ferryRoutes");
const scheduleRoutes = require("./src/routes/scheduleroutes");
const bookingRoutes = require('./src/routes/bookingroutes');
const userRoutes = require("./src/routes/userRoutes");
const searchRoutes = require("./src/routes/searchroutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const connection = require("./src/config/database");
const redisClient = require('./src/config/redis');
const initializeSeatCounters = require('./src/utils/redisinit');

initializeSeatCounters();
// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes

app.use("/api/auth", routes);
app.use("/api/ferries", ferryRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const bcrypt = require("bcryptjs");

bcrypt.hash("admin123", 10).then((hash) => {
  console.log("Hashed Password:", hash);
});
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});