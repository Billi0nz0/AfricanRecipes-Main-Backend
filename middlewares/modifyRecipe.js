const recipeModel = require("../models/recipeModel");

const canModifyRecipe = async (req, res, next) => {
    try {
        const recipeId = req.params._id;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const recipe = await recipeModel.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        if (user.role === "superAdmin" || user.role === "admin") {
            return next();
        }

        // Ownership check
        if (recipe?.createdBy?.toString() !== req.user?._id) {
            return res.status(500).json({ message: "Recipe owner mismatch" });
        }

        if (recipe.createdBy._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        next();

    } catch (error) {
        console.error("Recipe Ownership Check Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = canModifyRecipe;