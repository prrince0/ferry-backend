const express = require("express");
const app = express();

const dotenv = require("dotenv");
const passport = require("./src/config/passport");
const routes = require("./src/routes/authroutes");
const connection = require("./src/config/database");

dotenv.config();

app.use(express.json());
app.use(passport.initialize());

app.use(routes);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});