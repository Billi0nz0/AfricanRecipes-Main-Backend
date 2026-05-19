const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// prevent duplicate likes
likeSchema.index({ user: 1, recipe: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;