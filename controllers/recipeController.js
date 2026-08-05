const mongoose = require("mongoose");
const recipeModel = require("../models/recipeModel");
const likeModel = require("../models/likeModel");

exports.createRecipe = async (req, res) => {
  try {
    const {
      imageUrl,
      title,
      country,
      prepTime,
      cookTime,
      servings,
      difficulty,
      tags,
      ingredients,
      instructions,
      description,
      category,
      originalCreator,
    } = req.body;

    const createdBy = req.user?._id;

    if (!createdBy) {
      return res.status(401).json({
        message: "You must be signed in to create a recipe.",
      });
    }

    if (!req.user?.role) {
      return res.status(403).json({
        message: "You do not have permission to create recipes.",
      });
    }

    if (
      !imageUrl ||
      !title ||
      !country ||
      !prepTime ||
      !cookTime ||
      !servings ||
      !difficulty ||
      !description ||
      !category
    ) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        message: "Ingredients must be a non-empty array.",
      });
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({
        message: "Instructions must be a non-empty array.",
      });
    }

    if (originalCreator?.permissionGranted) {
      if (
        !originalCreator.name ||
        !originalCreator.platform ||
        !originalCreator.profileUrl
      ) {
        return res.status(400).json({
          message: "Please complete all original creator fields.",
        });
      }
    }

    const recipe = await recipeModel.create({
      imageUrl,
      title: title.trim(),
      country: country.trim(),
      prepTime,
      cookTime,
      servings,
      difficulty,
      tags: tags || [],
      ingredients,
      instructions,
      description: description.trim(),
      category,
      createdBy,
      originalCreator,
    });

    return res.status(201).json({
      message: "Recipe created successfully",
      recipe,
    });
  } catch (error) {
    console.error("Create Recipe Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    let { search = "", category, page = 1, limit = 30 } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 50);

    const filter = {};

    if (search.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    if (category) {
      filter.category = category;
    }

    const query = recipeModel
      .find(filter)
      .select(
        "title imageUrl country prepTime cookTime servings difficulty category createdBy createdAt",
      )
      .populate("createdBy", "username")
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (search.trim()) {
      query
        .select({
          score: {
            $meta: "textScore",
          },
        })
        .sort({
          score: {
            $meta: "textScore",
          },
        });
    } else {
      query.sort({
        createdAt: -1,
      });
    }

    const [recipes, total] = await Promise.all([
      query,
      recipeModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      recipes,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get Recipes Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const { _id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid recipe ID",
      });
    }

    const [recipe, likesCount, liked] = await Promise.all([
      recipeModel
        .findById(_id)
        .populate("createdBy", "username")
        .populate("category", "name")
        .lean(),

      likeModel.countDocuments({
        recipe: _id,
      }),

      userId
        ? likeModel.exists({
            recipe: _id,
            createdBy: userId,
          })
        : Promise.resolve(false),
    ]);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    return res.status(200).json({
      recipe,
      likesCount,
      isLiked: !!liked,
    });
  } catch (error) {
    console.error("Get Recipe Error:", error);

    return res.status(500).json({
      message: "Error fetching recipe",
    });
  }
};

exports.getMyRecipes = async (req, res) => {
  try {
    const userId = req.user._id;

    const sort = req.query.sort === "asc" ? 1 : -1;

    const recipes = await recipeModel
      .find({
        createdBy: userId,
      })
      .select(
        "title imageUrl country prepTime cookTime servings difficulty category createdAt isFeatured",
      )
      .populate("category", "name")
      .sort({
        createdAt: sort,
      })
      .lean();

    return res.status(200).json({
      recipes,
    });
  } catch (error) {
    console.error("Get My Recipes Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid recipe ID",
      });
    }

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
      "description",
      "category",
      "tags",
      "isFeatured",
      "originalCreator",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.originalCreator?.permissionGranted &&
      (!updates.originalCreator.name || !updates.originalCreator.profileUrl)
    ) {
      return res.status(400).json({
        message:
          "Creator name and profile link are required when permission is granted.",
      });
    }

    const recipe = await recipeModel
      .findByIdAndUpdate(
        _id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        },
      )
      .populate("category", "name")
      .populate("createdBy", "username");

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      message: "Recipe updated successfully",
      recipe,
    });
  } catch (error) {
    console.error("Update Recipe Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid recipe ID",
      });
    }

    const recipe = await recipeModel.findByIdAndDelete(_id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error("Delete Recipe Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getRecipesByCategory = async (req, res) => {
  try {
    const { _id } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [recipes, total] = await Promise.all([
      recipeModel
        .find({ category: _id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy", "username")
        .populate("category", "name"),

      recipeModel.countDocuments({
        category: _id,
      }),
    ]);

    res.status(200).json({
      recipes,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Category Recipes Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getRecipesByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;

    const [recipes, total] = await Promise.all([
      recipeModel
        .find({
          country: new RegExp(`^${country}$`, "i"),
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy", "username")
        .populate("category", "name"),

      recipeModel.countDocuments({
        country: new RegExp(`^${country}$`, "i"),
      }),
    ]);

    res.status(200).json({
      recipes,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Country Recipes Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getFeaturedRecipes = async (req, res) => {
  try {
    const featuredRecipes = await recipeModel
      .find(
        { isFeatured: true },
        {
          title: 1,
          imageUrl: 1,
          country: 1,
          prepTime: 1,
          cookTime: 1,
          servings: 1,
          difficulty: 1,
          category: 1,
          createdBy: 1,
          createdAt: 1,
        },
      )
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name")
      .populate("createdBy", "username")
      .lean();

    res.status(200).json({
      message: "Featured recipes retrieved successfully",
      recipes: featuredRecipes,
    });
  } catch (error) {
    console.error("Featured Recipes Error:", error);

    res.status(500).json({
      message: "Failed to fetch featured recipes",
    });
  }
};

exports.getRandomRecipes = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 20);

    const recipes = await recipeModel.aggregate([
      {
        $sample: {
          size: limit,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$createdBy",
      },

      {
        $unwind: "$category",
      },

      {
        $project: {
          title: 1,
          imageUrl: 1,
          country: 1,
          prepTime: 1,
          cookTime: 1,
          servings: 1,
          difficulty: 1,

          "createdBy.username": 1,
          "category.name": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error("Random Recipes Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch random recipes",
    });
  }
};
