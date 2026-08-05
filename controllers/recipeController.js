const mongoose = require("mongoose");
const recipeModel = require("../models/recipeModel");
const likeModel = require("../models/likeModel");
const cache = require("../utils/cache");
const keys = require("../utils/cacheKeys");

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

    const response = {
      message: "Recipe created successfully",
      recipe,
    };

    cache.flushAll();

    return res.status(201).json(response);


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

    const keyword = search.trim();

    const cacheKey = keys.ALL_RECIPES(page, limit, category, keyword);

    const cached = cache.get(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    page = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 50);

    const filter = {};

    if (keyword) {
      filter.$text = { $search: keyword };
    }

    if (category) {
      filter.category = category;
    }

    const projection = {
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
    };

    if (keyword) {
      projection.score = { $meta: "textScore" };
    }

    const query = recipeModel
      .find(filter, projection)
      .populate("createdBy", "username")
      .populate("category", "name")
      .lean();

    if (keyword) {
      query.sort({ score: { $meta: "textScore" } });
    } else {
      query.sort({ createdAt: -1 });
    }

    query.skip((page - 1) * limit).limit(limit);

    const [recipes, total] = await Promise.all([
      query,
      recipeModel.countDocuments(filter),
    ]);

    const response = {
      recipes,
      total,
      page,
      limit,
    };

    cache.set(cacheKey, response, 60);

    return res.status(200).json(response);

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

    const cacheKey = keys.RECIPE(_id);

    const cached = cache.get(cacheKey);

    if (cached && !req.user) {
      return res.status(200).json(cached);
    }

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

    const response = {
      recipe,
      likesCount,
      isLiked: !!liked,
    };

    // Don't cache user-specific likes
    if (!req.user) {
      cache.set(cacheKey, response, 60);
    }

    return res.status(200).json(response);
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

    cache.flushAll();

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

    cache.flushAll();

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

    const cacheKey = keys.CATEGORY(_id, page, limit);
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

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

    const response = {
      recipes,
      total,
      page,
      limit,
    };

    cache.set(cacheKey, response, 60);

    return res.status(200).json(response);
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

    const cacheKey = keys.COUNTRY(country, page, limit);

    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

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

    const response = {
      recipes,
      total,
      page,
      limit,
    };

    cache.set(cacheKey, response, 60);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Country Recipes Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getFeaturedRecipes = async (req, res) => {
  try {
    const cacheKey = keys.FEATURED;

    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const featuredRecipes = await recipeModel
      .find(
        { isFeatured: true },
        {
          title: 1,
          imageUrl: 1,
          description: 1,
        },
      )
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name")
      .populate("createdBy", "username")
      .lean();

    const response = {
      message: "Featured recipes retrieved successfully",
      recipes: featuredRecipes,
    };

    cache.set(cacheKey, response, 300); // 5 minutes

    return res.status(200).json(response);
  } catch (error) {
    console.error("Featured Recipes Error:", error);

    res.status(500).json({
      message: "Failed to fetch featured recipes",
    });
  }
};

exports.getRandomRecipes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const cacheKey = keys.RANDOM(limit);
        const cached = cache.get(cacheKey);

        if (cached) {
          return res.status(200).json(cached);
        }

        const randomRecipes = await recipeModel.aggregate([
            { $sample: { size: limit } }
        ]);

        const populatedRecipes = await recipeModel.populate(randomRecipes, [
            { path: "createdBy", select: "username email" },
            { path: "category", select: "name" }
        ]);

        const response = {
          success: true,
          recipes,
        };

        cache.set(cacheKey, response, 30);

        return res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch random recipes",
            error: error.message
        });
    }
};
