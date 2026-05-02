const express = require("express");
const router = express.Router();
const {
    createComment,
    getCommentsByPost,
    getAllComments,
    deleteComment,
    reportComment,
    getReportedComments
} = require("../controllers/commentController");

const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const canModifyComment = require('../middlewares/modifyComment')

router.post("/:_id", authenticate, createComment);
router.post("/:_id/report", authenticate, reportComment);
router.get("/reported", authenticate, authorize("admin", "superAdmin"), getReportedComments);
router.get("/recipe/:_id", getCommentsByPost);
router.get("/", authenticate, getAllComments);
router.delete("/:_id", authenticate, canModifyComment, deleteComment);


module.exports = router;