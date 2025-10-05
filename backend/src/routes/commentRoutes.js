import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createComment, getCommentsByLocation, toggleLike, addReply } from "../controllers/commentController.js";

const router = express.Router();

// Add a comment
router.post("/", protect, createComment);

// Get comments for location
router.get("/location/:locationId", getCommentsByLocation);

// Like / Unlike a comment
router.put("/like/:id", protect, toggleLike);

// Add a reply
router.post("/reply/:id", protect, addReply);

export default router;
