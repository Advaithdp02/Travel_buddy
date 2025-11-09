import express from "express";
import { protect, staffProtect } from "../middlewares/authMiddleware.js";
import {
  createComment,
  getCommentsByLocation,
  toggleLike,
  addReply,
  getAllComments,
  deleteComment,
  getCommentsForDistrict,
  deleteReply,
} from "../controllers/commentController.js";

const router = express.Router();

// =========================
// Public / User Routes
// =========================

// Add a comment
router.post("/", protect, createComment);

// Get comments for a location
router.get("/location/:locationId", getCommentsByLocation);

// Like / Unlike a comment
router.put("/like/:id", protect, toggleLike);

// Add a reply to a comment
router.post("/reply/:id", protect, addReply);
router.delete("/reply/:commentId/:replyId", protect, deleteReply);


router.get("/district/:id", getCommentsForDistrict);
// =========================
// staffProtect Routes
// =========================

// Get all comments (with optional districtId & locationId filters)
router.get("/", protect, staffProtect, getAllComments);

// Delete a comment
router.delete("/:id", protect, protect, deleteComment);


export default router;
