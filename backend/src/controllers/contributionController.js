import Contribution from "../models/Contribution.js";
import Location from "../models/Location.js";
import User from "../models/User.js"; 
import mongoose from "mongoose";

// Create a new contribution (submitted by user)
export const createContribution = async (req, res) => {
  try {
    const {
      user,
      location,
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
      hiddenGems
    } = req.body;

    // Convert location string to ObjectId
    const locationId = new mongoose.Types.ObjectId(location);
    const userId = new mongoose.Types.ObjectId(req.user);

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
      verified: false, // admin must verify
    });

    // Add contribution ID to the corresponding location
    const loc = await Location.findById(locationId);
    if (!loc) {
      return res.status(404).json({ message: "Location not found" });
    }

    loc.contributions.push(contribution._id);
    await loc.save();
    const userDoc = await User.findById(userId);
    if (userDoc) {
      userDoc.contributions.push(contribution._id);
      await userDoc.save();
    } else {
      console.warn("User not found when adding contribution:", userId);
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
