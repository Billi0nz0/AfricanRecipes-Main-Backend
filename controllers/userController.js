const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require("../middlewares/sendEmail");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase().trim();
    const username = req.body.username.toLowerCase().trim();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await userModel.findOne({
      $or: [{ email }, { username }]
    });

    if (exists) {
      if (exists.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
      if (exists.username === username) {
        return res.status(409).json({ message: "Username already in use" });
      }
    }

    const user = await userModel.create({
      username,
      email,
      password,
      role: "user"
    });

    res.status(201).json({
      message: "User created successfully",
      userName: user.username,
      role: user.role
    });

  } catch (error) {
    console.error("Registration Error", error.message);
    res.status(500).json({ message: "Server error" });
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

        if (user.isBanned) {
            return res.status(403).json({ message: "Your account has been banned. Please contact support." });
            console.log("isBanned:", user.isBanned);
        }

        res.clearCookie("token");

        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // set true if using HTTPS
            sameSite: "none", // or "none" if cross-site HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.status(200).json({ 
            message: "Login Successful", 
            userName: user.username, 
            role: user.role 
        });

        

    } catch (error) {
        console.error("Login Error", error.message);
        res.status(500).json({message: "Server error"});
    }
};

exports.logout = async(req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error", error.message);
        res.status(500).json({ message: "Server error" });
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

exports.updateProfile = async(req, res) => {
    try {
        const {_id} = req.params;
        const {email, password} = req.body;

        const user = await userModel.findByIdAndUpdate(_id, { email, password }, { new: true });

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });

    } catch (error) {
        console.error("Update Profile Error", error.message);
        res.status(500).json({message: "Server error"});
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

// password forgot/reset logic
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

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetURL = `${process.env.RESET_PASSWORD_URL}/${resetToken}`;

        const html = `
            <div style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">
            
                <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr>
                        <td align="center">
                            
                            <!-- Card -->
                            <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" 
                            style="background:#ffffff; border-radius:16px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,0.08); text-align:center;">
                            
                            <!-- Header -->
                            <tr>
                                <td>
                                <h2 style="color:#8d3304; margin-bottom:10px;">Reset Your Password</h2>
                                <p style="color:#666; font-size:14px;">Secure your account with a new password</p>
                                </td>
                            </tr>

                            <!-- Divider -->
                            <tr>
                                <td>
                                <div style="height:1px; background:#eee; margin:20px 0;"></div>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="text-align:left; color:#333; font-size:14px;">
                                <p>Hi <strong>${user.username}</strong>,</p>
                                <p>
                                    We received a request to reset your password. Click the button below to proceed.
                                </p>
                                </td>
                            </tr>

                            <!-- Button -->
                            <tr>
                                <td style="padding:25px 0;">
                                <a href="${resetURL}" 
                                    style="
                                    display:inline-block;
                                    padding:14px 28px;
                                    background:#8d3304;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-size:14px;
                                    font-weight:bold;
                                    letter-spacing:0.5px;
                                    ">
                                    Reset Password
                                </a>
                                </td>
                            </tr>

                            <!-- Expiry Notice -->
                            <tr>
                                <td style="color:#999; font-size:13px;">
                                This link expires in <strong>15 minutes</strong>.
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding-top:20px; color:#aaa; font-size:12px;">
                                <p>If you didn’t request this, you can safely ignore this email.</p>
                                </td>
                            </tr>

                            </table>

                            <!-- Bottom spacing -->
                            <div style="height:20px;"></div>

                        </td>
                    </tr>
                </table>

            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: "Password Reset",
            html,
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
