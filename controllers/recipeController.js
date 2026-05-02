const recipeModel = require("../models/recipeModel");

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
    const { search, category, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (search) {
      filter = { $text: { $search: search } };
    }

    if (category) {
      filter.category = category;
    }

    let query = recipeModel.find(filter);

    if (search) {
      query = query
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const recipes = await query
      .skip((page - 1) * limit)
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
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRecipeById = async (req, res) => {
    try {
        const { _id } = req.params;
        const recipe = await recipeModel.findById(_id)
            .populate("createdBy", "username email") 
            .populate("category", "name");

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json({
            message: "Recipe retrieved successfully",
            recipe
        });
    } catch (error) {
        console.error("Get Recipe by ID Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateRecipe = async (req, res) => {
    try {
        const { _id } = req.params;

        const updates = {};

        const fields = [
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
            "description"
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const forbiddenFields = ["createdBy", "_id"];

        for (let key of forbiddenFields) {
            if (req.body[key]) {
                delete req.body[key];
            }
        }

        const recipe = await recipeModel.findByIdAndUpdate(_id,
            { $set: updates },
            { new: true, runValidators: true }
        );

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

    

