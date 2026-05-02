const commentModel = require("../models/commentModel");
const userModel = require("../models/userModel");
const commentWarn = require("../middlewares/commentWarnings");

// ✅ Combine banned words
const allBannedWords = [
  "idiot","stupid","dumb","moron","fool","jerk","loser","trash",
  "bastard","shit","asshole","bitch","slut",
  "kill yourself","die",
  "porn","xxx","dildo",
  "disgusting","gross","nasty","inedible","rotten","burnt"
];

// ✅ Better profanity check (word boundaries)
const containsBadWord = (text) => {
  const regex = new RegExp(`\\b(${allBannedWords.join("|")})\\b`, "i");
  return regex.test(text);
};

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const recipeId = req.params._id;

    if (!content || !recipeId) {
      return res.status(400).json({ message: "Content and recipe are required" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Check block status
    if (user.isCommentDisabled) {
      if (user.commentDisabledUntil && Date.now() > new Date(user.commentDisabledUntil)) {
        user.isCommentDisabled = false;
        user.warnings = 0;
        user.commentDisabledUntil = null;
        await user.save();
      } else {
        return res.status(403).json({
          message: `Blocked until ${new Date(user.commentDisabledUntil).toLocaleString()}`
        });
      }
    }

    // ✅ Profanity check
    if (containsBadWord(content)) {
      const updatedUser = await commentWarn(user);

      if (updatedUser.isCommentDisabled) {
        return res.status(403).json({
          message: `Blocked until ${new Date(updatedUser.commentDisabledUntil).toLocaleString()}`
        });
      }

      return res.status(400).json({
        message: `Inappropriate language. Warning ${updatedUser.warnings}/9`
      });
    }

    // ✅ Create
    const comment = await commentModel.create({
      content,
      recipe: recipeId,
      createdBy: user._id
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment
    });

  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getCommentsByPost = async (req, res) => {
  try {
    const recipeId = req.params._id;

    const comments = await commentModel
      .find({ recipe: recipeId })
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Comments retrieved successfully",
      comments
    });

  } catch (error) {
    console.error("Get Comments Error", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const { _id } = req.params;

    const comment = await commentModel.findById(_id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = comment.createdBy.toString() === req.user._id.toString();
    const isAdmin = ["admin", "superAdmin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("Delete Comment Error", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.reportComment = async (req, res) => {
  try {
    const { _id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ message: "Valid reason is required" });
    }

    const comment = await commentModel.findById(_id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.createdBy.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot report your own comment" });
    }

    const alreadyReported = comment.reports.some(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: "Already reported" });
    }

    comment.reports.push({ user: userId, reason });

    // ✅ Auto-hide after 5 reports
    if (comment.reports.length >= 5) {
      comment.isHidden = true;
    }

    await comment.save();

    res.status(200).json({ message: "Comment reported successfully" });

  } catch (error) {
    console.error("Report Comment Error", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getReportedComments = async (req, res) => {
  try {
    const comments = await commentModel
      .find({ "reports.0": { $exists: true } })
      .populate("createdBy", "username")
      .populate("recipe", "title")
      .sort({ "reports.length": -1 });

    res.status(200).json({
      message: "Reported comments retrieved",
      comments
    });

  } catch (error) {
    console.error("Get Reported Comments Error", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllComments = async (req, res) => {
    try {
        const comments = await commentModel
            .find()
            .populate("createdBy", "username")
            .populate("recipe", "title");

        res.status(200).json({
            message: "All comments retrieved successfully",
            comments
        });

    } catch (error) {
        console.error("Get All Comments Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};