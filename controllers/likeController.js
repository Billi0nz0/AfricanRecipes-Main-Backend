const likeModel = require("../models/likeModel");
const recipeModel = require("../models/recipeModel");

exports.toggleLike = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = req.user;

    const recipe = await recipeModel.findById(_id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const existingLike = await likeModel.findOne({
      recipe: _id,
      createdBy: user._id,
    });

    let isLiked;

    if (existingLike) {
      await likeModel.deleteOne({ _id: existingLike._id });
      isLiked = false;
    } else {
      await likeModel.create({ recipe: _id, createdBy: user._id });
      isLiked = true;
    }

    // ✅ always recalculate
    const likesCount = await likeModel.countDocuments({ recipe: _id });

    recipe.likes = likesCount;
    await recipe.save();

    res.json({
      message: "Like status updated",
      likes: likesCount,
      isLiked, // 🔥 IMPORTANT for frontend
    });

  } catch (error) {
    console.error("TOGGLE LIKE ERROR:", error),
    res.status(500).json({
      message: "Error updating like status",
      error,
    });
  }
};

exports.getLikesByRecipe = async (req, res) => {
  try {
    const { _id } = req.params;
    const likes = await likeModel.countDocuments({ recipe: _id });
    res.json({ likes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching like count", error });
  }
};

exports.getLikedRecipesByUser = async (req, res) => {
  try {
    const user = req.user;
    const likedRecipes = await likeModel
      .find({ createdBy: user._id })
      .populate("recipe", "title");
    res.json({ likedRecipes: likedRecipes.map((like) => like.recipe) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching liked recipes", error });
  }
};

exports.getAllLikes = async (req, res) => {
  try {
    const likes = await likeModel.find().populate("recipe", "title");
    res.json({ likes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all likes", error });
  }
};
