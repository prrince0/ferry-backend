const mysql = require("mysql2/promise");
require("dotenv").config();

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "ferry_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection (optional)
const testConnection = async () => {
    try {
        const conn = await connection.getConnection();
        console.log("Connected to MySQL");
        conn.release();
    } catch (err) {
        console.log("DB connection failed:", err);
    }
};

testConnection();

module.exports = connection;