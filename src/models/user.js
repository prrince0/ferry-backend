const db = require("../config/database");

// Create new user (INSERT)
const createUser = async (userData) => {
    const { username, email, password } = userData;
    
    if (!username || !email || !password) {
        throw new Error("Username, email and password are required");
    }
    
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const [result] = await db.query(query, [username, email, password]);
    
    return {
        id: result.insertId,
        username,
        email
    };
};

// Get user by email (SELECT)
const getUserByEmail = async (email) => {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.query(query, [email]);
    
    return rows.length > 0 ? rows[0] : null;
};

// Get user by id (SELECT)
const getUserById = async (id) => {
    const query = "SELECT * FROM users WHERE id = ?";
    const [rows] = await db.query(query, [id]);
    
    return rows.length > 0 ? rows[0] : null;
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById
};