const express = require("express");
const route = express.Router();
const { translateRecipe } = require("../controllers/translateController");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 9, // limit each IP to 9 requests per windowMs
  message: "Too many request, please try again"
});

route.post("/:id/translate", translateRecipe);

module.exports = route;