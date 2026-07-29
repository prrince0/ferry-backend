const User = require("../models/user");

const getProfile = async (req, res) => {

    try {

        const user = await User.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};

module.exports = {
    getProfile
};