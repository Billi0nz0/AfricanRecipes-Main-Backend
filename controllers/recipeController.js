const mongoose = require("mongoose");
const recipeModel = require("../models/recipeModel");
const likeModel = require("../models/likeModel");

exports.createRecipe = async (req, res) => {
    try {
        const { imageUrl, title, country, prepTime, tags, servings, cookTime, difficulty, ingredients, instructions, description, category } = req.body;

        const createdBy = req.user._id;

        if (
            !imageUrl || 
            !title || 
            !country ||
            !tags || 
            !ingredients || 
            !instructions || 
            !description || 
            !category || 
            !difficulty ||
            !createdBy || 
            !prepTime || 
            !servings || 
            !cookTime
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ message: "Ingredients must be a non-empty array" });
        }

        if(!req.user.role) {
            return res.status(403).json({ message: "You must sign in to create a recipe" });
        }

        const recipe = await recipeModel.create({
            imageUrl,
            title,
            country,
            ingredients,
            tags,
            instructions,
            description,
            category,
            prepTime,
            servings,
            cookTime,
            difficulty,
            createdBy
        });

        res.status(201).json({
            message: "Recipe created successfully",
            recipe
        });

    } catch (error) {
        console.error("Create Recipe Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const { search = "",
      category,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search across multiple fields
    if (search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          country: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ingredients: {
            $elemMatch: {
              $regex: search,
              $options: "i",
            },
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    const recipes = await recipeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("createdBy", "username")
      .populate("category", "name");

    const total = await recipeModel.countDocuments(filter);

    res.status(200).json({
      recipes,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Get Recipes Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


exports.getRecipeById = async (req, res) => {
  try {
    const { _id } = req.params;
    const userId = req.user?._id;

    const recipe = await recipeModel
      .findById(_id)
      .populate("createdBy", "username");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // ✅ likes count
    const likesCount = await likeModel.countDocuments({ recipe: _id });

    // ✅ is liked (only if logged in)
    let isLiked = false;

    if (userId) {
      const existing = await likeModel.findOne({
        recipe: _id,
        createdBy: userId
      });

      isLiked = !!existing;
    }

    res.json({
      recipe,
      likesCount,
      isLiked
    });

  } catch (error) {
    console.error("GET RECIPE ERROR:", error);
    res.status(500).json({ message: "Error fetching recipe" });
  }
};

exports.getMyRecipes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sort = "desc" } = req.query; 

    const sortOption = sort === "asc" 
      ? { createdAt: 1 } 
      : { createdAt: -1 };

    const recipes = await recipeModel
      .find({ createdBy: userId })
      .sort(sortOption)
      .populate("category", "name");

    res.status(200).json({
      recipes
    });

  } catch (error) {
    console.error("Get My Recipes Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    // ✅ Fields allowed to update
    const allowedFields = [
      "imageUrl",
      "title",
      "country",
      "prepTime",
      "servings",
      "cookTime",
      "difficulty",
      "ingredients",
      "instructions",
      "isFeatured",
      "description",
      "category",   
      "tags"        
    ];

    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // ✅ Remove forbidden fields safely
    delete updates.createdBy;
    delete updates._id;

    const recipe = await recipeModel.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate("category", "name")
    .populate("createdBy", "username");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json({
      message: "Recipe updated successfully",
      recipe
    });

  } catch (error) {
    console.error("Update Recipe Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRecipe = async (req, res) => {
    try {
        const { _id } = req.params;
        const recipe = await recipeModel.findByIdAndDelete(_id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        res.status(200).json({
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        console.error("Delete Recipe Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getRecipesByCategory = async (req, res) => {
    try {
        const { _id } = req.params;

        const { page = 1, limit = 10 } = req.query;

        const recipes = await recipeModel.find({ categoryId: _id })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("createdBy", "username email")
        .populate("category", "name");

        res.status(200).json({ message: "Recipes retrieved successfully", recipes});
    } catch (error) {
        console.error("Get Recipes by Category Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getRecipesByCountry = async (req, res) => {
    try {
        const { country } = req.params;

        const recipes = await recipeModel.find({ country: country })
            .populate("createdBy", "username")
            .populate("category", "name");

        res.status(200).json({ message: "Recipes retrieved successfully", recipes });
    } catch (error) {
        console.error("Get Recipes by Country Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getFeaturedRecipes = async (req, res) => {
  try {
    const featuredRecipes = await recipeModel
      .find({ isFeatured: true })
      .populate("createdBy", "username email")
      .populate("category", "name")
      .limit(8);

    res.status(200).json({
        message: "Featured recipes retrieved successfully",
        recipes: featuredRecipes
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch featured recipes",
      error: error.message
    });
  }
};

exports.getRandomRecipes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const randomRecipes = await recipeModel.aggregate([
            { $sample: { size: limit } }
        ]);

        const populatedRecipes = await recipeModel.populate(randomRecipes, [
            { path: "createdBy", select: "username email" },
            { path: "category", select: "name" }
        ]);

        res.status(200).json({
            success: true,
            recipes: populatedRecipes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch random recipes",
            error: error.message
        });
    }
};

    

