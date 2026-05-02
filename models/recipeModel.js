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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

recipeSchema.index(
  { 
    title: "text",
    description: "text",
    country: "text",
    "ingredients.name": "text"
  },
  {
    weights: { title: 5, "ingredients.name": 4, description: 2, country: 1}
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;