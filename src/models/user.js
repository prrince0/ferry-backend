const db = require("../config/database");

// Create new user (INSERT)
const createUser = async (userData) => {
    const { full_name, email, password_hash } = userData;
    
    if (!full_name || !email || !password_hash) {
        throw new Error("Full name, email and password are required");
    }
    
    const query = "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)";
    const [result] = await db.query(query, [full_name, email, password_hash]);
    
    return {
        id: result.insertId,
        full_name,
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