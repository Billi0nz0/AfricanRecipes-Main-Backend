const express = require("express");
const route = express.Router();
const {register, login, logout, forgotPassword, resetPassword} = require("../controllers/userController");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many request, please try again"
});

route.post("/register", limiter, register);
route.post("/login", login);
route.post("/logout", logout);
route.post("/forgotPassword", forgotPassword);
route.post("/resetPassword/:token", resetPassword);

module.exports = route;