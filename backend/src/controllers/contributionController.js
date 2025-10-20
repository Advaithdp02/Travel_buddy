import Contribution from "../models/Contribution.js";
import Location from "../models/Location.js";
import User from "../models/User.js"; 
import mongoose from "mongoose";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";

export const createContribution = async (req, res) => {
  try {
    const {
      user,
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

    const locationId = new mongoose.Types.ObjectId(location);
    const userId = new mongoose.Types.ObjectId(req.user);

    const folderName = `contributions/${locationId}/${userId}`;

    let images = [];
    let coverImage = "";

    console.log("Files received:", req.files);

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // If you want one image as cover, you can decide by name or order
        if (file.fieldname === "coverImage") {
          coverImage = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
        } else {
          const url = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
          images.push(url);
        }
      }
    }

    const contribution = await Contribution.create({
      user: userId,
      location: locationId,
      description,
      images,
      coverImage,
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
      verified: false,
    });

    // Add contribution ID to the location
    const loc = await Location.findById(locationId);
    if (!loc) return res.status(404).json({ message: "Location not found" });

    loc.contributions.push(contribution._id);
    await loc.save();

    const userDoc = await User.findById(userId);
    if (userDoc) {
      userDoc.contributions.push(contribution._id);
      await userDoc.save();
    }

    res.status(201).json(contribution);
  } catch (err) {
    console.error("Error creating contribution:", err);
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
      .populate("comments");

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