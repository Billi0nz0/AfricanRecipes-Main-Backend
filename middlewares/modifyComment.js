const commentModel = require("../models/commentModel");

const canModifyComment = async (req, res, next) => {
  try {
    const commentId = req.params._id;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (user.role === "superAdmin" || user.role === "admin") {
      return next();
    }

    const commentOwnerId = comment.createdBy.toString();
    const userId = user._id.toString();

    if (commentOwnerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  } catch (error) {
    console.error("Comment Ownership Check Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = canModifyComment;