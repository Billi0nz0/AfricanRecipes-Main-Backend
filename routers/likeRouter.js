const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");

const {
  toggleLike,
  getLikesByRecipe,
  getLikedRecipesByUser,
  getAllLikes,
  isLiked
} = require("../controllers/likeController");


router.post("/toggle/:_id", authenticate, toggleLike);

router.get("/recipe/:_id", getLikesByRecipe);

// optional but useful
router.get("/is-liked/:_id", authenticate, isLiked);

router.get("/user/liked", authenticate, getLikedRecipesByUser);

module.exports = router;