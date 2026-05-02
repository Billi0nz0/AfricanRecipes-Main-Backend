const express = require("express");
const route = express.Router();
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const canModifyProfile = require("../middlewares/modifyRole");
const {getProfile, searchUsers, updateProfile, deleteProfile, updateUserRole, toggleBanUser} = require("../controllers/userController");

route.get("/profile/:_id", authenticate, getProfile);
route.get("/profiles", authenticate, searchUsers);
route.put("/profile/:_id", authenticate, canModifyProfile, updateProfile);
route.patch("/profile/:_id/role", authenticate, authorize("superAdmin"), updateUserRole);
route.patch("/profile/:_id/ban", authenticate, authorize("superAdmin"), toggleBanUser);
route.delete("/profile/:_id", authenticate, canModifyProfile, deleteProfile);

module.exports = route;