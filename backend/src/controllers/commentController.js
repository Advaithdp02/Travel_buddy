import Comment from "../models/Comments.js";
import Location from "../models/Location.js";
import Contribution from "../models/Contribution.js";

// Add a comment
export const createComment = async (req, res) => {
  try {
    const { location, text } = req.body;

    if (!location || !text) {
      return res.status(400).json({ message: "Location and text are required" });
    }

    // Ensure location exists
    const locationDoc = await Location.findById(location);
    if (!locationDoc) {
      return res.status(404).json({ message: "Location not found" });
    }

    const comment = await Comment.create({
      user: req.user.id, // assuming JWT middleware adds req.user
      location,
      text,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a reply to a comment
export const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ user: req.user.id, text });
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get comments for a location
export const getCommentsByLocation = async (req, res) => {
  try {
    const comments = await Comment.find({ location: req.params.locationId })
      .populate("user", "name username profilePic")
      .populate("replies.user", "name username profilePic")

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;
    const index = comment.likes.indexOf(userId);

    if (index === -1) {
      comment.likes.push(userId); // Like
    } else {
      comment.likes.splice(index, 1); // Unlike
    }

    await comment.save();
    res.status(200).json({ likes: comment.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};