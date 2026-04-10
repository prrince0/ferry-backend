const authController = require('../controllers/authController');  
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Middleware');  // Fixed: correct file name

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;