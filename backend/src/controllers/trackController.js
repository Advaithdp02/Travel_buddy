import PageVisit from "../models/PageVisit.js";
import Location from "../models/Location.js";
import mongoose from "mongoose";

// POST /api/track
export const trackVisit = async (req, res) => {
  try {
    const { user, sessionId, path, timeSpent, isAnonymous, deviceInfo } = req.body;

    if (!sessionId || !path || timeSpent == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let locationName = path;
    let districtName = "Unknown";

    try {
      const segments = path.split("/"); // handle paths like '/locations/64f123abc...'
      const possibleId = segments[segments.length - 1];

      if (mongoose.Types.ObjectId.isValid(possibleId)) {
        const locationDoc = await Location.findById(possibleId).populate("district", "name").select("name district");
        if (locationDoc) {
          locationName = locationDoc.name;
          districtName = locationDoc.district?.name || "Unknown";
        }
      }
    } catch (err) {
      console.warn("Failed to resolve location ID:", err);
    }

    // Save page visit
    const visit = await PageVisit.create({
      user: user || null,
      sessionId,
      location: locationName,
      district: districtName,
      timeSpent,
      isAnonymous,
      deviceInfo: deviceInfo || {}
    });

    res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/track/stats - optional analytics

export const getStats = async (req, res) => {
  try {
    // Overall stats
    const overall = await PageVisit.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
    ]);
    const uniqueUsers = await PageVisit.distinct("user", { user: { $ne: null } });

    // Visits per location
    const byLocation = await PageVisit.aggregate([
      {
        $group: {
          _id: "$location",
          totalVisits: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    // Visits per district
    const byDistrict = await PageVisit.aggregate([
      {
        $group: {
          _id: "$district",
          totalVisits: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    // Visits per user
    const byUser = await PageVisit.aggregate([
      {
        $group: {
          _id: "$user",
          totalVisits: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    // Most visited pages
    const topPages = await PageVisit.aggregate([
      {
        $group: {
          _id: "$location",
          totalVisits: { $sum: 1 },
        },
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 10 },
    ]);

    // Most active users (top visitors)
    const topUsers = await PageVisit.aggregate([
      {
        $group: {
          _id: "$user",
          totalVisits: { $sum: 1 },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      overall: overall[0] || {},
      byLocation,
      byDistrict,
      byUser,
      topPages,
      topUsers,
      uniqueUsers: uniqueUsers.length,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

export const recordExit = async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      location,
      district,
      timeSpent,
      exitReason,
      isSiteExit,
    } = req.body;

    if (!sessionId || !location) {
      return res.status(400).json({ success: false, message: "Missing sessionId or location" });
    }
    console.log("Exit tracking data received:", req.body);
    const visit = await PageVisit.create({
      user: new mongoose.Types.ObjectId(req.body.user),
      sessionId,
      location,
      district: district || "Unknown",
      timeSpent: timeSpent || 0,
      isAnonymous: !userId,
      exitReason: exitReason || "unknown",
      isSiteExit: isSiteExit || false,
    });

    return res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("Exit tracking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};