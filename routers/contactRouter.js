const express = require("express");
const route = express.Router();
const { contactUs } = require("../controllers/contactController");
const rateLimit = require("express-rate-limit");

const contactLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24hrs
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many contact requests. Please try again in 15 minutes or use another contact method.",
    },
});

route.post("/", contactLimiter, authenticate, contactUs);

module.exports = route;
