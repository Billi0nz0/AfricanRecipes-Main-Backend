const canModifyProfile = (req, res, next) => {
    if (req.user.id === req.params._id || req.user.role === "superAdmin") {
        return next();
    }

    return res.status(403).json({ message: "Not allowed" });
};

module.exports = canModifyProfile;