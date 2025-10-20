import Comment from "../models/Comments.js";
import Location from "../models/Location.js";
import User from "../models/User.js";

// Add a comment
export const createComment = async (req, res) => {
  try {
    const { location, text } = req.body;
    if (!location || !text) {
      return res.status(400).json({ message: "Location and text are required" });
    }

    const locationDoc = await Location.findById(location);
    if (!locationDoc) return res.status(404).json({ message: "Location not found" });

    const comment = await Comment.create({
      user: req.user.id,
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
    if (!text) return res.status(400).json({ message: "Reply text is required" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ user: req.user.id, text });
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error adding reply:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get comments by location
export const getCommentsByLocation = async (req, res) => {
  try {
    const comments = await Comment.find({ location: req.params.locationId })
      .populate("user", "name username profilePic")
      .populate("replies.user", "name username profilePic");
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all comments (with optional filters: district, location)
export const getAllComments = async (req, res) => {
  try {
    const { districtId, locationId } = req.query;
    let filter = {};

    if (locationId) filter.location = locationId;

    let commentsQuery = Comment.find(filter)
      .populate("user", "name username profilePic")
      .populate("replies.user", "name username profilePic")
      .sort({ createdAt: -1 });

    if (districtId) {
      // Get all locations in the district
      const locations = await Location.find({ district: districtId }).select("_id");
      commentsQuery = commentsQuery.where("location").in(locations.map((l) => l._id));
    }

    const comments = await commentsQuery.exec();
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Toggle like/unlike
export const toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;
    const index = comment.likes.indexOf(userId);

    if (index === -1) comment.likes.push(userId); // Like
    else comment.likes.splice(index, 1); // Unlike

    await comment.save();
    res.status(200).json({ likes: comment.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete comment (admin only)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    await comment.remove();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

