import Contribution from "../models/Contribution.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import District from "../models/District.js";
import mongoose from "mongoose";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";
import ContributionComment from "../models/ContributionComment.js";

export const createContribution = async (req, res) => {
  try {
    // User authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;

    // Extract fields from body
    const {
      title,
      subtitle,
      district,
      description,
      latitude,
      longitude,
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
      points,
    } = req.body;

    // Required fields check
    if (!title || !district || !description || !latitude || !longitude) {
      return res.status(400).json({
        message:
          "Missing required fields (title, district, description, latitude, longitude)",
      });
    }

    // Parse JSON fields if sent as string
    const parsedActivities = typeof activities === "string" ? JSON.parse(activities) : activities || [];
    const parsedFacilities = typeof facilities === "string" ? JSON.parse(facilities) : facilities || [];
    const parsedRatings = typeof ratings === "string" ? JSON.parse(ratings) : ratings || {};
    const parsedHiddenGems = typeof hiddenGems === "string" ? JSON.parse(hiddenGems) : hiddenGems || [];
    const parsedPoints = typeof points === "string" ? JSON.parse(points) : points || [];

    // Upload files to S3
    let images = [];
    let coverImage = "";

    const folderName = `contributions/${userId}/${Date.now()}`;

    if (req.files) {
      // Cover Image
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        const file = req.files.coverImage[0];
        coverImage = await uploadToS3(
          file.buffer,
          file.originalname,
          folderName,
          file.mimetype
        );
      }

      // Images (multiple)
      if (req.files.images && req.files.images.length > 0) {
        for (const file of req.files.images) {
          const uploaded = await uploadToS3(
            file.buffer,
            file.originalname,
            folderName,
            file.mimetype
          );
          images.push(uploaded);
        }
      }
    }

    // Create the Contribution (NO location field now)
    const contribution = new Contribution({
      user: userId,
      title,
      subtitle,
      district, // text – admin will map it later
      description,
      coordinates: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      points: parsedPoints,

      coverImage,
      images,

      bestTimeToVisit,
      crowded: crowded === "true" || crowded === true,
      familyFriendly: familyFriendly === "true" || familyFriendly === true,
      petFriendly: petFriendly === "true" || petFriendly === true,
      accessibility: accessibility || "Unknown",

      activities: parsedActivities,
      facilities: parsedFacilities,
      ratings: parsedRatings,

      tips: tips || "",
      hiddenGems: parsedHiddenGems,

      verified: false, // Admin must approve
    });

    await contribution.save();

    // Add to User contributions
    const user = await User.findById(userId);
    if (user) {
      user.contributions.push(contribution._id);
      await user.save();
    }

    res.status(201).json({ success: true, contribution });
  } catch (err) {
    console.error("❌ Create Contribution Error:", err);
    res.status(500).json({ message: err.message });
  }
};



// Get a single contribution by ID
export const getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate("user", "name username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name username profilePic" }
      });

    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    res.status(200).json({
      success: true,
      contribution,
    });
  } catch (err) {
    console.error("❌ Get Contribution Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getContributionsForDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check if param is a District ID
    let districtName = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const district = await District.findById(id);
      if (!district) {
        return res.status(404).json({ message: "District not found" });
      }
      districtName = district.name;
    } else {
      // 2️⃣ Else it's a district NAME
      districtName = id;
    }

    // 3️⃣ Now fetch contributions matching this district (case-insensitive)
    const contributions = await Contribution.find({
      district: { $regex: `^${districtName}$`, $options: "i" }
    })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      district: districtName,
      count: contributions.length,
      contributions,
    });
  } catch (err) {
    console.error("❌ Get Contributions For District Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Admin: Verify a contribution
export const verifyContribution = async (req, res) => {
  try {
    const contribId = req.params.id;
    const c = await Contribution.findById(contribId);
    if (!c) return res.status(404).json({ message: "Contribution not found" });

    if (c.verified && c.approvedLocation) {
      return res.status(400).json({ message: "Contribution already verified" });
    }

    // ---------- DISTRICT ----------
    let districtDoc = await District.findOne({
      name: { $regex: `^${c.district}$`, $options: "i" }
    });
    if (!districtDoc) {
      districtDoc = await District.create({ name: c.district });
    }

    // --------------------------------------------------
    //  ⭐ AUTO-GENERATED CONTENT FROM USER CONTRIBUTION ⭐
    // --------------------------------------------------

    // Subtitle based on activities or best time
    const generatedSubtitle =
      c.activities?.length
        ? `A popular place for ${c.activities.slice(0, 3).join(", ")}`
        : `A notable destination in ${c.district}`;

    // Points list (short facts)
    const points = [];

    if (c.bestTimeToVisit)
      points.push(`Best time to visit: ${c.bestTimeToVisit}`);

    if (c.activities?.length)
      points.push(`Popular activities: ${c.activities.join(", ")}`);

    if (c.facilities?.length)
      points.push(`Available facilities: ${c.facilities.join(", ")}`);

    points.push(
      `Family friendly: ${c.familyFriendly ? "Yes" : "No"}`,
      `Pet friendly: ${c.petFriendly ? "Yes" : "No"}`,
      `Accessibility: ${c.accessibility}`,
      `Crowd level: ${c.crowded ? "High" : "Low to Moderate"}`
    );

    // Ratings summary
    if (c.ratings) {
      const r = c.ratings;
      points.push(
        `Overall rating: ${r.overall || "-"}`,
        `Cleanliness: ${r.cleanliness || "-"}`,
        `Safety: ${r.safety || "-"}`,
        `Value for money: ${r.valueForMoney || "-"}`
      );
    }

    // Generated descriptive paragraph
    const generatedDescription = `
${c.description || ""}

Visitors report that the atmosphere is ${
      c.crowded ? "often crowded" : "generally calm"
    } and family friendly. ${
      c.bestTimeToVisit
        ? `The recommended time to visit is ${c.bestTimeToVisit}.`
        : ""
    } ${
      c.hiddenGems?.length
        ? `Some hidden gems mentioned include: ${c.hiddenGems.join(", ")}.`
        : ""
    } ${
      c.tips
        ? `Traveler tips: ${c.tips}`
        : ""
    }
`.replace(/\s+/g, " ").trim();

    // --------------------------------------------------
    //  CREATE LOCATION WITH GENERATED CONTENT
    // --------------------------------------------------

    const newLocation = await Location.create({
      name: c.title,
      subtitle: generatedSubtitle,
      description: generatedDescription,
      district: districtDoc._id,

      points: points,
      images: c.images || [],
      coverImage: c.coverImage || "",

      terrain: "",
      reviewLength: 0,
      review: 0,

      coordinates: c.coordinates,
      contributions: [c._id],
      comments: [],

      // Keep raw user suggestions for admin editing
      contributionMeta: {
        userSubtitle: c.subtitle,
        userHiddenGems: c.hiddenGems,
        userActivities: c.activities,
        userFacilities: c.facilities,
        userTips: c.tips,
        userRatings: c.ratings,
      },
    });

    // Mark Contribution Verified
    c.verified = true;
    c.approvedLocation = newLocation._id;
    await c.save();

    return res.status(200).json({
      success: true,
      message: "Contribution verified + Auto content generated",
      location: newLocation,
    });

  } catch (err) {
    console.error("verifyContribution error:", err);
    return res.status(500).json({ message: err.message });
  }
};



// ✅ Get all contributions (Admin)
export const getAllContributions = async (req, res) => {
  try {
    // Optional filtering: ?status=pending | verified | all
    const status = req.query.status || "all";
    let filter = {};

    if (status === "pending") filter.verified = false;
    if (status === "verified") filter.verified = true;

    const contributions = await Contribution.find(filter)
      .populate("user", "name email username profilePic")
      .populate("approvedLocation", "name district");

    res.status(200).json({
      success: true,
      count: contributions.length,
      contributions,
    });
  } catch (error) {
    console.error("❌ Error fetching contributions:", error);
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

    const userId = req.user._id || req.user.id;

    // Authorization: only owner or admin can delete
    const isOwner = contribution.user.toString() === userId.toString();
    const isAdmin = req.user && req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this contribution" });
    }

    // Safety: Prevent deleting contribution that already created a Location
    if (contribution.verified && contribution.approvedLocation) {
      return res.status(400).json({
        message: "Cannot delete a verified contribution that created a Location"
      });
    }

    // Remove from User's contributions list
    const user = await User.findById(contribution.user);
    if (user) {
      user.contributions = user.contributions.filter(
        (cId) => cId.toString() !== id
      );
      await user.save();
    }

    // OPTIONAL: delete images from S3 (only if you want)
    // contribute.images.forEach(url => deleteFromS3(extractKey(url)));
    // if (contribution.coverImage) deleteFromS3(extractKey(contribution.coverImage));

    await contribution.deleteOne();

    res.status(200).json({ message: "Contribution deleted successfully" });
  } catch (err) {
    console.error("❌ deleteContribution error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getContributionsByUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const contributions = await Contribution.find({ user: userId })
      .populate("approvedLocation", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contributions.length,
      contributions,
    });
  } catch (err) {
    console.error("❌ Get user contributions error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching user contributions",
    });
  }
};







