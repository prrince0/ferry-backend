const mysql = require("mysql2/promise");
require("dotenv").config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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