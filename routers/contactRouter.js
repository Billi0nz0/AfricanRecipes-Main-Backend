const express = require("express");
const route = express.Router();
const { contactUs } = require("../controllers/contactController");
const rateLimit = require("express-rate-limit");

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many contact requests. Please try again in 15 minutes or use another contact method.",
    },
});

route.post("/", contactLimiter, contactUs);

module.exports = route;
