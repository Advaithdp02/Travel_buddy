import Contribution from "../models/Contribution.js";
import Location from "../models/Location.js";
import User from "../models/User.js"; 
import District from "../models/District.js";
import mongoose from "mongoose";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";
import ContributionComment from "../models/ContributionComment.js";



export const createContribution = async (req, res) => {
  try {
    const {
      location,
      description,
      bestTimeToVisit,
      crowded,
      familyFriendly,
      petFriendly,
      accessibility,
      activities,
      facilities,
      ratings,
      tips,
      hiddenGems,
    } = req.body;

    // Make sure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id; // from auth middleware
    const locationId =new  mongoose.Types.ObjectId(location);

    const folderName = `contributions/${locationId}/${userId}`;

    let images = [];
    let coverImage = "";

    console.log("Files received:", req.files);

    // Upload images to S3 if any
    if (req.files) {
  // Cover Image
  if (req.files.coverImage && req.files.coverImage.length > 0) {
    const file = req.files.coverImage[0];
    coverImage = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
  }

  // Other Images
  if (req.files.images && req.files.images.length > 0) {
    for (const file of req.files.images) {
      const url = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
      images.push(url);
    }
  }
}


    // Create contribution
    const contribution = new Contribution({
      user: userId,
      location: locationId,
      description,
      coverImage,
      images,
      bestTimeToVisit: bestTimeToVisit || "",
      crowded: crowded === "true" || crowded === true,
      familyFriendly: familyFriendly === "true" || familyFriendly === true,
      petFriendly: petFriendly === "true" || petFriendly === true,
      accessibility: accessibility || "Unknown",
      activities: activities ? JSON.parse(activities) : [],
      facilities: facilities ? JSON.parse(facilities) : [],
      ratings: ratings ? JSON.parse(ratings) : {},
      tips: tips || "",
      hiddenGems: hiddenGems ? JSON.parse(hiddenGems) : [],
      verified: false,
    });

    await contribution.save();

    // Update Location
    const loc = await Location.findById(locationId);
    if (!loc) return res.status(404).json({ message: "Location not found" });
    loc.contributions.push(contribution._id);
    await loc.save();

    // Update User
    const userDoc = await User.findById(userId);
    if (userDoc) {
      userDoc.contributions.push(contribution._id);
      await userDoc.save();
    }

    res.status(201).json(contribution);
  } catch (err) {
    console.error("Create Contribution Error:", err);
    res.status(500).json({ message: err.message });
  }
};
// Get verified contributions for a specific location
export const getContributionsByLocation = async (req, res) => {
  try {
    const contributions = await Contribution.find({
      location: req.params.locationId,
      verified: true
    })
      .populate("user", "name username profilePic")
      .populate("comments")
      .populate("location", "name");

    res.status(200).json(contributions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single contribution by ID
export const getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate("user", "name username profilePic")
      .populate("comments");

    if (!contribution)
      return res.status(404).json({ message: "Contribution not found" });

    res.status(200).json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getContributionsForDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await District.findById(id).populate("locations");
    if (!district) return res.status(404).json({ message: "District not found" });

    const locationIds = district.locations.map((loc) => loc._id);
    const contributions = await Contribution.find({ location: { $in: locationIds } })
      .populate("user", "name profileImage")
      .populate("location", "name")
      .sort({ createdAt: -1 });
    console.log("District ID:", id);
console.log("District locations:", district.locations);

    res.json(contributions);
  } catch (err) {
    console.error("Get District Contributions Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Admin: Verify a contribution
export const verifyContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution)
      return res.status(404).json({ message: "Contribution not found" });

    contribution.verified = true;
    await contribution.save();

    res.status(200).json({ message: "Contribution verified", contribution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Get all contributions (Admin)
export const getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .populate("user", "name email")
      .populate("location", "name country");

    res.status(200).json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Failed to fetch contributions" });
  }
};

export const deleteContribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid contribution ID" });
    }

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // Remove reference from location
    const location = await Location.findById(contribution.location);
    if (location) {
      location.contributions = location.contributions.filter(
        (cId) => cId.toString() !== id
      );
      await location.save();
    }

    // Remove reference from user
    const user = await User.findById(contribution.user);
    if (user) {
      user.contributions = user.contributions.filter(
        (cId) => cId.toString() !== id
      );
      await user.save();
    }

    await contribution.deleteOne();

    res.status(200).json({ message: "Contribution deleted successfully" });
  } catch (err) {
    console.error("Delete contribution error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getContributionsByUser = async (req, res) => {
  try {
    const userId = req.user.id; // set by protect middleware
    const contributions = await Contribution.find({ user: userId });

    res.status(200).json({
      success: true,
      contributions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error fetching user contributions" });
  }
};
// Add comment to a contribution
export const addContributionComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: contributionId } = req.params;
    const userId = req.user._id;

    if (!text?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = new ContributionComment({
      user: userId,
      contribution: contributionId,
      text,
    });

    await comment.save();

    // Add comment reference to contribution
    const contribution = await Contribution.findById(contributionId);
    contribution.comments.push(comment._id);
    await contribution.save();

    const populatedComment = await comment.populate("user", "name username profilePic");

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Like/unlike a comment
export const toggleContributionCommentLike = async (req, res) => {
  try {
    const { contribId, commentId } = req.params;
    const userId = req.user.id;

    // Check contribution exists
    const contribution = await Contribution.findById(contribId);
    if (!contribution)
      return res.status(404).json({ message: "Contribution not found" });

    // Find comment
    const comment = await ContributionComment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    // Toggle like/unlike
    const hasLiked = comment.likes.some((id) => id.toString() === userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: hasLiked ? "Comment unliked" : "Comment liked",
      likesCount: comment.likes.length,
    });
  } catch (err) {
    console.error("❌ toggleContributionCommentLike Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all comments for a contribution
export const getContributionComments = async (req, res) => {
  try {
    const { id: contributionId } = req.params;
    const comments = await ContributionComment.find({ contribution: contributionId })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const toggleContributionLike = async (req, res) => {
  try {
    const { id } = req.params; // contribution ID
    const userId = req.user.id; // from protect middleware

    if (!id) return res.status(400).json({ message: "Contribution ID is required" });

    const contribution = await Contribution.findById(id);
    if (!contribution) return res.status(404).json({ message: "Contribution not found" });

    const hasLiked = contribution.likes.some((uid) => uid.toString() === userId);

    if (hasLiked) {
      // Unlike
      contribution.likes = contribution.likes.filter((uid) => uid.toString() !== userId);
    } else {
      // Like
      contribution.likes.push(userId);
    }

    await contribution.save();

    res.status(200).json({
      message: hasLiked ? "Contribution unliked" : "Contribution liked",
      likes: contribution.likes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
