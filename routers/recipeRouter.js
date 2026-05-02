const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const canModifyRecipe = require("../middlewares/modifyRecipe");
const { 
    createRecipe, 
    getAllRecipes, 
    getRecipeById, 
    updateRecipe, 
    deleteRecipe, 
    getRecipesByCategory,
    getFeaturedRecipes,
    getRandomRecipes
} = require("../controllers/recipeController");


router.post("/", authenticate, createRecipe);
router.get("/", getAllRecipes);
router.get("/featured", getFeaturedRecipes);
router.get("/random", getRandomRecipes);
router.get("/category/:categoryId", getRecipesByCategory);
router.get("/:_id", getRecipeById);
router.put("/:_id", authenticate, canModifyRecipe, updateRecipe);
router.delete("/:_id", authenticate, canModifyRecipe, deleteRecipe);

module.exports = router;
