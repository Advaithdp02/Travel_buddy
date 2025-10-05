import Comment from "../models/Comments.js";
import Location from "../models/Location.js";
import Contribution from "../models/Contribution.js";

// Add a comment
export const createComment = async (req, res) => {
  try {
    const { location, contribution, text } = req.body;

    const comment = await Comment.create({
      user: req.user.id,
      location,
      contribution,
      text
    });

    // Add reference
    if (contribution) {
      const contrib = await Contribution.findById(contribution);
      contrib.comments.push(comment._id);
      await contrib.save();
    } else {
      const loc = await Location.findById(location);
      loc.comments.push(comment._id);
      await loc.save();
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like / Unlike a comment
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
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      .populate("contribution", "title");

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
