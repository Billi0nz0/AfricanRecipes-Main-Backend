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
      user: user._id,
    });

    let isLiked;

    if (existingLike) {
      await likeModel.deleteOne({ _id: existingLike._id });
      isLiked = false;
    } else {
      await likeModel.create({ recipe: _id, user: user._id });
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

exports.isLiked = async (req, res) => {
  try {
    const recipeId = req.params._id;
    const userId = req.user?._id;

    if (!userId) {
      return res.json({ isLiked: false });
    }

    const existing = await likeModel.findOne({
      recipe: recipeId,
      user: userId
    });

    return res.json({ isLiked: !!existing });
  } catch (err) {
    console.error("isLiked error:", err);
    res.status(500).json({ message: "Server error" });
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
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sort = req.query.sort || "latest";

    let sortOption = {};

    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const likes = await likeModel
     .find({
        $or: [
          { user: userId },
          { createdBy: userId }
        ]
      }) 
      .populate("recipe")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await likeModel.countDocuments({
      user: userId
    });

    res.json({
      recipes: likes.map((l) => l.recipe),
      pages: Math.ceil(total / limit),
      page
    });

  } catch (err) {
    console.error("GET LIKED ERROR:", err);
    res.status(500).json({
      message: "Error fetching liked recipes",
      error: err.message
    });
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
