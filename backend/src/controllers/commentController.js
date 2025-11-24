import Comment from "../models/Comments.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import District from "../models/District.js";

// Add a comment
// Add a comment
export const createComment = async (req, res) => {
  try {
    const { location, text } = req.body;
    if (!location || !text) {
      return res.status(400).json({ message: "Location and text are required" });
    }

    const locationDoc = await Location.findById(location);
    if (!locationDoc) return res.status(404).json({ message: "Location not found" });

    // Create the comment
    const comment = await Comment.create({
      user: req.user.id,
      location,
      text,
    });

    // Push the comment ID to the location's comments array
    locationDoc.comments.push(comment._id);
    await locationDoc.save();

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
// Delete a reply to a comment
export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Find the reply inside comment.replies
    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if current user is the reply author
    if (reply.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this reply" });
    }

    // Remove the reply
    reply.deleteOne();
    await comment.save();

    res.status(200).json({
      message: "Reply deleted successfully",
      comment,
    });
  } catch (err) {
    console.error("Error deleting reply:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get comments by location


export const getCommentsByLocation = async (req, res) => {
  try {
    // 1️⃣ Fetch comments for the location
    let comments = await Comment.find({ location: req.params.locationId })
      .populate("user", "name username profilePic")
      .lean(); // convert to plain JS objects

    // 2️⃣ Collect all unique user IDs from replies
    const replyUserIds = [];
    comments.forEach(comment => {
      comment.replies.forEach(reply => {
        if (reply.user) replyUserIds.push(reply.user.toString());
      });
    });

    const uniqueUserIds = [...new Set(replyUserIds)];

    // 3️⃣ Fetch all users at once
    const users = await User.find({ _id: { $in: uniqueUserIds } })
      .select("name username profilePic");

    // Map users by ID for easy lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // 4️⃣ Replace each reply.user with full user object
    comments.forEach(comment => {
      comment.replies = comment.replies.map(reply => ({
        ...reply,
        user: userMap[reply.user.toString()] || null
      }));
    });
    
    // 5️⃣ Return
    res.json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /comments?districtId=&locationId=&page=&limit=
export const getAllComments = async (req, res) => {
  try {
    let { districtId, locationId, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (districtId) filter.district = districtId;
    if (locationId) filter.location = locationId;

    const total = await Comment.countDocuments(filter);

    const comments = await Comment.find(filter)
      .populate("user", "name")
      .populate("location", "name")
      .populate("replies.user", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
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
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getCommentsForDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Fetch the district and populate its locations
    const district = await District.findById(id).populate("locations", "name district");
    if (!district) return res.status(404).json({ message: "District not found" });

    // ✅ Collect all location IDs
    const locationIds = district.locations.map((loc) => loc._id);

    // ✅ Fetch comments belonging to those locations
    const comments = await Comment.find({ location: { $in: locationIds } })
      .populate("user", "name username profilePic")
      .populate("location", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Get District Comments Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
