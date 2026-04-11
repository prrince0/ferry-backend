const express = require("express");
const dotenv = require("dotenv");

// ✅ LOAD .env FIRST
dotenv.config();
console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
console.log("DB_PASSWORD from env:", process.env.DB_PASSWORD ? "✅ Loaded" : "❌ Missing");
console.log("DB_HOST from env:", process.env.DB_HOST ? "✅ Loaded" : "❌ Missing");

const app = express();
const cors = require("cors");
const passport = require("./src/config/passport");
const routes = require("./src/routes/authroutes");
const ferryRoutes = require("./src/routes/ferryRoutes");
const connection = require("./src/config/database");

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", routes);
app.use("/api/ferries", ferryRoutes);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});