const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Recipe = require("../models/recipeModel");

router.get("/summary", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();

 
    // const topSearches = await Search.aggregate([
    //     { $group: { _id: "$recipeId", count: { $sum: 1 } } },
    //     { $sort: { count: -1 } },
    //     { $limit: 5 },
    //     { $lookup: { from: "recipes", localField: "_id", foreignField: "_id", as: "recipe" } }
    // ]);

    res.json({
      totalUsers,
      totalRecipes,
    //   topSearches
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;