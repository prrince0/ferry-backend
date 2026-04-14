const express = require("express");
const dotenv = require("dotenv");

//  LOAD .env FIRST
dotenv.config();

const app = express();
const cors = require("cors");
const passport = require("./src/config/passport");
const routes = require("./src/routes/authroutes");
const ferryRoutes = require("./src/routes/ferryRoutes");
const scheduleRoutes = require("./src/routes/scheduleroutes");
const connection = require("./src/config/database");

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes

app.use("/api/auth", routes);
app.use("/api/ferries", ferryRoutes);
app.use("/api/schedules", scheduleRoutes);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});