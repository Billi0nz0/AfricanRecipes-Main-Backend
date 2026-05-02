const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const { 
    toggleLike,
    getLikesByRecipe,
    getLikedRecipesByUser,
    getAllLikes
} = require("../controllers/likeController");

router.post("/toggle/:_id", authenticate, toggleLike);
router.post("/like/:_id", authenticate, toggleLike);
router.post("/unlike/:_id", authenticate, toggleLike);
router.get("/recipe/:_id", getLikesByRecipe);
router.get("/user/liked", authenticate, getLikedRecipesByUser);
router.get("/", getAllLikes);

module.exports = router;