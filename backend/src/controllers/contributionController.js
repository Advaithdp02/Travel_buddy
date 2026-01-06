import Contribution from "../models/Contribution.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import District from "../models/District.js";
import mongoose from "mongoose";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";

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
      terrain,
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
    const parsedActivities =
      typeof activities === "string"
        ? JSON.parse(activities)
        : activities || [];
    const parsedFacilities =
      typeof facilities === "string"
        ? JSON.parse(facilities)
        : facilities || [];
    const parsedRatings =
      typeof ratings === "string" ? JSON.parse(ratings) : ratings || {};
    const parsedHiddenGems =
      typeof hiddenGems === "string"
        ? JSON.parse(hiddenGems)
        : hiddenGems || [];
    const parsedPoints =
      typeof points === "string" ? JSON.parse(points) : points || [];

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
      terrain,
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

export const updateContribution = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const contribution = await Contribution.findById(id);

    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // 🔒 Only owner can update
    if (contribution.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔒 Optional: block update after approval
    if (contribution.verified) {
      return res
        .status(403)
        .json({ message: "Approved contributions cannot be edited" });
    }

    const {
      title,
      subtitle,
      district,
      terrain,
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
    console.log("REQ BODY TERRAIN:", req.body.terrain);


    // Parse JSON fields
    const parsedActivities =
      typeof activities === "string" ? JSON.parse(activities) : activities;
    const parsedFacilities =
      typeof facilities === "string" ? JSON.parse(facilities) : facilities;
    const parsedRatings =
      typeof ratings === "string" ? JSON.parse(ratings) : ratings;
    const parsedHiddenGems =
      typeof hiddenGems === "string"
        ? JSON.parse(hiddenGems)
        : hiddenGems;
    const parsedPoints =
      typeof points === "string" ? JSON.parse(points) : points;

    // Update text fields
    if (title) contribution.title = title;
    if (subtitle !== undefined) contribution.subtitle = subtitle;
    if (district) contribution.district = district;
    if (description) contribution.description = description;
    if (bestTimeToVisit) contribution.bestTimeToVisit = bestTimeToVisit;
    if (accessibility) contribution.accessibility = accessibility;
    if (terrain) contribution.terrain = terrain;

    contribution.crowded = crowded === "true" || crowded === true;
    contribution.familyFriendly =
      familyFriendly === "true" || familyFriendly === true;
    contribution.petFriendly =
      petFriendly === "true" || petFriendly === true;

    if (latitude && longitude) {
      contribution.coordinates = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (parsedActivities) contribution.activities = parsedActivities;
    if (parsedFacilities) contribution.facilities = parsedFacilities;
    if (parsedRatings) contribution.ratings = parsedRatings;
    if (parsedHiddenGems) contribution.hiddenGems = parsedHiddenGems;
    if (parsedPoints) contribution.points = parsedPoints;
    if (tips !== undefined) contribution.tips = tips;

    // 📸 Handle file updates
    const folderName = `contributions/${userId}/${Date.now()}`;

    if (req.files?.coverImage?.length) {
      const file = req.files.coverImage[0];
      contribution.coverImage = await uploadToS3(
        file.buffer,
        file.originalname,
        folderName,
        file.mimetype
      );
    }

    if (req.files?.images?.length) {
      const newImages = [];
      for (const file of req.files.images) {
        const uploaded = await uploadToS3(
          file.buffer,
          file.originalname,
          folderName,
          file.mimetype
        );
        newImages.push(uploaded);
      }

      // append new images (don’t delete old)
      contribution.images.push(...newImages);
    }

    await contribution.save();

    res.json({ success: true, contribution });
  } catch (err) {
    console.error("❌ Update Contribution Error:", err);
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
        populate: { path: "user", select: "name username profilePic" },
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
      district: { $regex: `^${districtName}$`, $options: "i" },
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
    const adminTerrain = req.body.terrain; // optional admin override

    // -----------------------------------------
    // FETCH CONTRIBUTION
    // -----------------------------------------
    const c = await Contribution.findById(contribId);
    if (!c) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    if (c.verified) {
      return res.status(400).json({ message: "Contribution already verified" });
    }

    // -----------------------------------------
    // VALIDATE COORDINATES
    // -----------------------------------------
    if (
      !c.coordinates?.coordinates ||
      c.coordinates.coordinates.length !== 2
    ) {
      return res
        .status(400)
        .json({ message: "Contribution has invalid coordinates" });
    }

    // -----------------------------------------
    // NORMALIZE DISTRICT NAME
    // -----------------------------------------
    const normalize = (str) =>
      str.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

    const districtName = normalize(c.district);

    const districtDoc = await District.findOne({ name: districtName });
    if (!districtDoc) {
      return res.status(400).json({
        message: `District "${districtName}" not found`,
      });
    }

    // -----------------------------------------
    // ELEVATION FETCH
    // -----------------------------------------
    async function getElevation(lat, lng) {
      try {
        const response = await fetch(
          `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
        );
        const data = await response.json();
        return data.results?.[0]?.elevation ?? null;
      } catch (err) {
        console.error("Elevation API error:", err);
        return null;
      }
    }

    // -----------------------------------------
    // TERRAIN DETECTION
    // -----------------------------------------
    function detectTerrain(elevation, activities, description) {
      const text = (description || "").toLowerCase();

      if (activities?.includes("Beach / Swimming")) return "Beach";
      if (activities?.includes("Adventure / Trekking")) return "Hilly";
      if (activities?.includes("Photography") && elevation > 600)
        return "Mountain";

      if (text.includes("forest")) return "Forest";
      if (text.includes("desert") || text.includes("sand")) return "Desert";
      if (text.includes("rock") || text.includes("cliff")) return "Rocky";
      if (text.includes("river") || text.includes("waterfall")) return "River";
      if (text.includes("city") || text.includes("urban")) return "Urban";

      if (elevation !== null) {
        if (elevation < 30) return "Beach";
        if (elevation < 200) return "Plain";
        if (elevation < 800) return "Hilly";
        return "Mountain";
      }

      return "Unknown";
    }

    // -----------------------------------------
    // COORDINATES → TERRAIN
    // -----------------------------------------
    const [lng, lat] = c.coordinates.coordinates;
    const elevation = await getElevation(lat, lng);

    const autoTerrain = detectTerrain(
      elevation,
      c.activities,
      c.description
    );

    const finalTerrain =
      typeof adminTerrain === "string" &&
      adminTerrain.trim() !== "" &&
      adminTerrain !== "none"
        ? adminTerrain
        : autoTerrain;

    // -----------------------------------------
    // SUBTITLE
    // -----------------------------------------
    const generatedSubtitle = c.activities?.length
      ? `A popular place for ${c.activities.slice(0, 3).join(", ")}`
      : `A notable destination in ${districtName}`;

    // -----------------------------------------
    // POINTS
    // -----------------------------------------
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

    if (c.ratings) {
      points.push(
        `Overall rating: ${c.ratings.overall || "-"}`,
        `Cleanliness: ${c.ratings.cleanliness || "-"}`,
        `Safety: ${c.ratings.safety || "-"}`,
        `Value for money: ${c.ratings.valueForMoney || "-"}`
      );
    }

    // -----------------------------------------
    // DESCRIPTION
    // -----------------------------------------
    const generatedDescription = `
${c.description || ""}

Visitors describe the atmosphere as ${
      c.crowded ? "often crowded" : "generally calm"
    } and family-friendly.
${c.bestTimeToVisit ? `Recommended time: ${c.bestTimeToVisit}.` : ""}
${c.hiddenGems?.length ? `Hidden gems: ${c.hiddenGems.join(", ")}.` : ""}
${c.tips ? `Traveler tips: ${c.tips}` : ""}
`
      .replace(/\s+/g, " ")
      .trim();

    // -----------------------------------------
    // MERGE IMAGES (COVER + IMAGES)
    // -----------------------------------------
    const locationImages = [
      ...new Set(
        [c.coverImage, ...(c.images || [])].filter(Boolean)
      ),
    ];

    // -----------------------------------------
    // CREATE LOCATION
    // -----------------------------------------
    const newLocation = await Location.create({
      name: c.title,
      subtitle: generatedSubtitle,
      description: generatedDescription,
      district: districtDoc._id,

      points,
      images: locationImages, 

      terrain: finalTerrain,
      review: 0,
      reviewLength: 0,

      coordinates: c.coordinates,
      contributions: [c._id],
      comments: [],
    });

    // -----------------------------------------
    // MARK CONTRIBUTION VERIFIED
    // -----------------------------------------
    c.verified = true;
    c.approvedLocation = newLocation._id;
    c.terrain = finalTerrain;
    await c.save();

    return res.status(200).json({
      success: true,
      message: "Contribution verified successfully",
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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const skip = (page - 1) * limit;

    const { status } = req.query;

    // ---------- FILTER ----------
    const query = {};

    if (status === "pending") query.verified = false;
    if (status === "approved") query.verified = true;
    // status === "all" → no filter

    // ---------- DATA ----------
    const [contributions, total] = await Promise.all([
      Contribution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Contribution.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      contributions,
      currentPage: page,
      totalPages,
      totalItems: total,
    });
  } catch (error) {
    console.error("Get contributions error:", error);
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
      return res
        .status(403)
        .json({ message: "Not authorized to delete this contribution" });
    }

    // Safety: Prevent deleting contribution that already created a Location
    if (contribution.verified && contribution.approvedLocation) {
      return res.status(400).json({
        message:
          "Cannot delete a verified contribution that created a Location",
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
