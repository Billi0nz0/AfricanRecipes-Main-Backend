const express = require("express");
const route = express.Router();
const {register, verifyEmail, login, logout, forgotPassword, resetPassword} = require("../controllers/userController");

const rateLimit = require("express-rate-limit");
const regLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration attempts. Please try again in 15 minutes.",
    },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes.",
    },
});

const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many password reset requests. Please try again in 15 minutes.",
    },
});


route.post("/login", loginLimiter, login);
route.post("/logout", logout);
route.post("/register", regLimiter, register);
route.post("/forgotPassword", resetLimiter, forgotPassword);
route.get("/verifyEmail/:token", verifyEmail);
route.post("/resetPassword/:token", resetPassword);

module.exports = route;
