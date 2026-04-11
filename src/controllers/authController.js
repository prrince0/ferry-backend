const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;  // ✅ password from frontend, not password_hash
        
        // Check if user exists
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user (order matches your model: full_name, email, password_hash)
        const newUser = await User.createUser({
            full_name,
            email,
            password_hash: hashedPassword
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error registering user' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;  // ✅ password from frontend
        
        // Find user by email
        const user = await User.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Error logging in' });
    }
};

module.exports = {
    register,
    login
};