const userModel = require("../models/userModel");

const canModifyProfile = async (req, res, next) => {
    try {

        const loggedInUser = req.user;

        const targetUserId = req.params._id;

        if (!loggedInUser) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const targetUser = await userModel.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (loggedInUser.role === "superAdmin") {
            return next();
        }

        if (loggedInUser.role === "admin") {

            if (
                targetUser.role === "admin" ||
                targetUser.role === "superAdmin"
            ) {
                return res.status(403).json({
                    message:
                    "Admins cannot modify other admins or super admins"
                });
            }

            return next();
        }

        if (
            loggedInUser._id.toString() ===
            targetUserId.toString()
        ) {
            return next();
        }

        return res.status(403).json({
            message:
            "You are not allowed to modify this profile"
        });

    } catch (error) {

        console.error(
            "canModifyProfile Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = canModifyProfile;