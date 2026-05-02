const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reports: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });


const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;