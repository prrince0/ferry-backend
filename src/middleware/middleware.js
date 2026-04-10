const passport = require('passport');  
require("../config/passport");  
// protect middleware with JSON error response
const protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Not authorized. Invalid or missing token.' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// restrictTo middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {   
            return res.status(403).json({ 
                message: `Forbidden. ${req.user.role} is not allowed.` 
            });
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};

