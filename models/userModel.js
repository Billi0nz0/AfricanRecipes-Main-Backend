const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userIdGen = require('../middlewares/userId');

const userSchema = new mongoose.Schema({
    userId: {type: String, default: userIdGen},

    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    role: {type: String, enum: ['user', 'admin', 'superAdmin'], default: 'user'},

    password: {type: String, required: true},

    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    lastLogin: { type: Date },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    warnings: { type: Number, default: 0 },
    isCommentDisabled: { type: Boolean, default: false },
    commentDisabledUntil: { type: Date, default: null },

    createdAt: {type: Date, default: Date.now}
}, {timestamps: true}   
);

userSchema.pre("save", async function () {
    try {
        if (!this.isModified("password")) return;

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;