const express = require("express");
const route = express.Router();
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const { 
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

route.post("/", authenticate, authorize("admin", "superAdmin"), createCategory);

route.get("/:_id/category", getCategoryById);
route.get("/", getCategories);

route.put("/:_id", authenticate, authorize("admin", "superAdmin"), updateCategory);
route.delete("/:_id", authenticate, authorize("admin", "superAdmin"), deleteCategory);

module.exports = route;