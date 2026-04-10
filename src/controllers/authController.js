const User = require('../models/user');

// Register new user
const register = (req, res) => {
    const { username, email, password } = req.body;
    User.createUser({ username, email, password }, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error registering user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
};

// Login user
const login = (req, res) => {
    const { email, password } = req.body;
    User.authenticate({ email, password }, (err, token) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({ token });
    });
};

module.exports = {
    register,
    login
};