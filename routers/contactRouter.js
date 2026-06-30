const express = require("express");
const route = express.Router();
const { contactUs } = require("../controllers/contactController");

route.post("/", contactUs);

module.exports = route;