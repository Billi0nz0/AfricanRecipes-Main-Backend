const userModel = require('../models/userModel');
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require("../middlewares/sendEmail");
const passwordResetMail = require("../emailTemplates/passwordReset")
const verifyEmailTemplate = require("../emailTemplates/verifyMail")
const welcomeTemplate = require("../emailTemplates/welcomeMail");





exports.getMe = async (req, res) => {
    try {
        const token = req.cookies.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired, please login again" });
        }
        res.status(401).json({ message: "Invalid token" });
    }
};

exports.getProfile = async(req, res) => {
    try {
        const {_id} = req.params;

        const user = await userModel.findById(_id).select("-password");
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({ message: "Profile retrieved successfully", user });
    } catch (error) {
        console.error("Get Profile Error", error.message);
        res.status(500).json({message: "Server error"});
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { search, status, sort } = req.query;

        const filter = {};

        if (search) {
            filter.username = { $regex: search, $options: "i" };
        }

        if (status === "banned") {
            filter.isBanned = true;
        } else if (status === "active") {
            filter.isBanned = false;
        }

        let sortOption = {};
        if (sort === "newest") {
            sortOption = { createdAt: -1 }; // newest first
        } else if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const users = await userModel
            .find(filter)
            .sort(sortOption)
            .select("-password -__v");

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });

    } catch (error) {
        console.error("Search Users Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { _id } = req.params;
        const { username, profilePhoto } = req.body;

        const user = await userModel.findById(_id);

        if (!user) {
            return res.status(404).json({ message: "User not found"});
        }

        if (username) {

            const existingUser =
                await userModel.findOne({
                    username: username.toLowerCase().trim(),
                    _id: { $ne: _id }
                });

            if (existingUser) {
                return res.status(400).json({
                    message: "Username already exists"
                });
            }

            user.username =
                username.toLowerCase().trim();
        }

        if (profilePhoto) {

            const FOUR_MONTHS = 1000 * 60 * 60 * 24 * 30 * 4;

            if (user.oldPhotoUpdate) {

                const diff =
                    Date.now() -
                    new Date(
                        user.oldPhotoUpdate
                    ).getTime();

                if (diff < FOUR_MONTHS) {

                    const daysLeft = Math.ceil(
                        (FOUR_MONTHS - diff) /
                        (1000 * 60 * 60 * 24)
                    );

                    return res.status(403).json({
                        message:
                        `You can change your profile photo again in ${daysLeft} days`
                    });
                }
            }

            user.profilePhoto = profilePhoto;

            user.oldPhotoUpdate = new Date();
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};  

exports.deleteProfile = async (req, res) => {
    try {
        const { _id } = req.params;

        const user = await userModel.findById(_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "superAdmin") {
            return res.status(403).json({ message: "Cannot delete a superAdmin" });
        }

        await userModel.findByIdAndDelete(_id);

        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
        console.error("Delete Profile Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};  

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["user", "admin", "superAdmin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await userModel.findById(req.params._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.id === req.params._id) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (user.role === "superAdmin") {
      return res.status(403).json({ message: "Cannot change a superAdmin role" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error("Update User Role Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleBanUser = async (req, res) => {
    try {
        const { isBanned } = req.body;

        if (typeof isBanned !== "boolean") {
            return res.status(400).json({ message: "isBanned must be true or false" });
        }

        const user = await userModel.findById(req.params._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.id === req.params._id) {
            return res.status(400).json({ message: "You cannot ban yourself" });
        }

        if (user.role === "superAdmin") {
            return res.status(403).json({ message: "Cannot ban a superAdmin" });
        }

        user.isBanned = isBanned;
        await user.save();

        res.status(200).json({
        message: isBanned
            ? "User has been banned"
            : "User has been unbanned",
        user,
        });
    } catch (error) {
        console.error("Ban User Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};


// Auth
exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const normalizeEmail = req.body.email.toLowerCase().trim();
        const normalizeUsername = req.body.username.toLowerCase().trim();

        const exists = await userModel.findOne({
            $or: [{ email }, { username }],
        });

        if (exists) {
            if (exists.email === email) {
                return res.status(409).json({
                    message: "Email already exists",
                });
            }

            return res.status(409).json({
                message: "Username already in use",
            });
        }

        const verificationToken =
            crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const user = await userModel.create({
            username: normalizeUsername,
            email: normalizeEmail,
            password,
            role: "user",
            isVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        });

        const verificationLink =
            `${process.env.EMAIL_VERIFICATION_URL}/${verificationToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Verify your email address",
                html: verifyEmailTemplate({
                    name: user.username,
                    verificationLink,
                }),
            });
        } catch (err) {
            await user.deleteOne();

            return res.status(500).json({
                success: false,
                message: "We couldn't send the verification email. Please try registering again.",
            });
        }

        return res.status(201).json({
            success: true,
            message:
                "Account created successfully. Please verify your email to continue.",
        });

    } catch (error) {
        console.error("Registration Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {

        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await userModel.findOne({
            emailVerificationToken: hashedToken,
        });

        if (!user) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/verification-failed`
            );
        }

        if (user.isVerified) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/verified`
            );
        }

        if (user.emailVerificationExpires < Date.now()) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/verification-expired`
            );
        }

        user.isVerified = true;
        user.emailVerificationExpires = undefined;

        await user.save();

        try {
            await sendEmail({
                to: user.email,
                subject: `Welcome to ${process.env.APP_NAME}! 🎉`,
                html: welcomeTemplate({
                    name: user.username,
                }),
            });
        } catch (err) {
            console.error("Welcome email failed:", err);
        }
    
        return res.redirect(
            `${process.env.FRONTEND_URL}/verified`
        );

    } catch (error) {

        console.error("Email Verification:", error);

        return res.redirect(
            `${process.env.FRONTEND_URL}/verification-failed`
        );

    }
};

exports.login = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }

        const user = await userModel.findOne({email: email.toLowerCase().trim()});
        if (!user) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({message: "Invalid credentials"});
            
        }

        if (!user.isVerified) {
            return res.status(403).json({
                verified: false,
                message:
                    "Please verify your email before logging in.",
            });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: "Your account has been banned. Please contact support." });
            console.log("isBanned:", user.isBanned);
        }

        user.lastLogin = new Date();
        await user.save();

        res.clearCookie("token");

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // set true if using HTTPS
            sameSite: "lax", // or "none" if cross-site HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.status(200).json({ 
            message: "Login Successful",
            role: user.role, 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto
            }
        });

        

    } catch (error) {
        console.error("Login Error", error.message);
        res.status(500).json({message: "Server error"});
    }
};

exports.logout = async(req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};



// password forgot/reset logic
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Old and new password are required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        // ❗ IMPORTANT: assign raw password only
        user.password = newPassword;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { emailOrUsername } = req.body;

        const user = await userModel.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase().trim() },
                { username: emailOrUsername.trim() }
            ]
        });

        if (!user) {
            return res.status(200).json({
                message: "If an account exists, a reset link has been sent"
            });
        }

        const crypto = require("crypto");

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto .createHash("sha256") .update(resetToken) .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetURL = `${process.env.RESET_PASSWORD_URL}/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset",
            html: passwordResetMail(user, resetURL),
        });

        res.status(200).json({
            message: "If an account exists, a reset link has been sent"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        // Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token, please request a new link" });
        }

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Reset Password Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};