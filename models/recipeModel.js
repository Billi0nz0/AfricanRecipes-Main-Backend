const mongoose = require('mongoose');
const recipeIdGen = require('../middlewares/recipeId');

const ingredientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    quantity: {type: String, required: true}
  }, 
{ _id: false }
);

const recipeSchema = new mongoose.Schema({
    recipeId: { type: String, default: recipeIdGen, unique: true },
    title: { type: String, required: true },
    country: {type: String, required: true},
    prepTime: { type: Number, required: true },
    servings: { type: Number, required: true},
    cookTime: { type: Number, required: true},
    tags: [{ type: String, lowercase: true }],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium"},
    description: { type: String, required: true },
    instructions: [{ type: String, required: true }],
    imageUrl: { type: String },
    ingredients: { type: [ingredientSchema], required: true },
    isFeatured: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalCreator: {
      name: {
          type: String,
          default: "",
          trim: true,
      },

      username: {
          type: String,
          default: "",
          trim: true,
      },

      platform: {
          type: String,
          enum: [
              "Instagram",
              "TikTok",
              "YouTube",
              "Facebook",
              "Website",
              "Other",
              ""
          ],
          default: "",
      },

      profileUrl: {
          type: String,
          default: "",
          trim: true,
      },

      permissionGranted: {
          type: Boolean,
          default: false,
      },
  },
}, { timestamps: true });

recipeSchema.index(
  {
    title: "text",
    description: "text",
    country: "text",
    tags: "text",
    "ingredients.name": "text",
  },
  {
    weights: {
      title: 6,
      tags: 5,
      "ingredients.name": 4,
      description: 2,
      country: 1,
    },
  }
);

recipeSchema.index({ category: 1 });
recipeSchema.index({ isFeatured: 1 });
recipeSchema.index({ createdAt: -1 });

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
