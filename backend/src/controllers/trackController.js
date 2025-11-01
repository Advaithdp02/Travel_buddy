import PageVisit from "../models/PageVisit.js";
import Location from "../models/Location.js";
import User from "../models/User.js"
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
      location,  // could be string or object with id
      timeSpent,
      exitReason,
      isSiteExit,
    } = req.body;

    if (!sessionId || !location) {
      return res.status(400).json({ success: false, message: "Missing sessionId or location" });
    }

    let locationName = typeof location === "string" ? location : location.name || "";
    let districtName = "Unknown";

    // Resolve location ID if needed
    try {
      let locationId = "";
      if (typeof location === "object" && location.id) {
        locationId = location.id;
      } else if (typeof location === "string") {
        const segments = location.split("/");
        const possibleId = segments[segments.length - 1];
        if (mongoose.Types.ObjectId.isValid(possibleId)) {
          locationId = possibleId;
        }
      }

      if (locationId) {
        const locationDoc = await Location.findById(locationId)
          .populate("district", "name")
          .select("name district");
        if (locationDoc) {
          locationName = locationDoc.name;
          districtName = locationDoc.district?.name || "Unknown";
        }
      }
    } catch (err) {
      console.warn("Failed to resolve location ID:", err);
    }

    // Save exit record
    const visit = await PageVisit.create({
      user: userId || null,
      sessionId,
      location: locationName,
      district: districtName,
      timeSpent: timeSpent || 0,
      exitReason: exitReason || "unknown",
      isSiteExit: !!isSiteExit,
      isAnonymous: !userId,
    });

    res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("Exit tracking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET /api/track/user-stats

export const getUserStats = async (req, res) => {
  try {
    const stats = await PageVisit.aggregate([
      {
        $group: {
          _id: "$user",
          totalVisits: { $sum: 1 },
          totalTimeSpent: { $sum: "$timeSpent" },
          uniqueLocations: { $addToSet: "$location" },
          uniqueDistricts: { $addToSet: "$district" },
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    // --- populate usernames ---
    const populatedStats = await Promise.all(
      stats.map(async (item) => {
        if (item._id) {
          const user = await User.findById(item._id).select("username");
          return {
            ...item,
            user: item._id,
            username: user ? user.username : "Unknown User",
          };
        } else {
          return {
            ...item,
            user: null,
            username: "Anonymous",
          };
        }
      })
    );

    res.json({ success: true, data: populatedStats });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user stats" });
  }
};
// GET /api/track/user-details/:userId
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Determine if it's an anonymous user or logged-in user
    const matchStage =
      userId === "anonymous"
        ? { user: null }
        : { user: new mongoose.Types.ObjectId(userId) };

    // Fetch all visit records for that user
    const visits = await PageVisit.aggregate([
      { $match: matchStage },
      {
        $project: {
          _id: 0,
          location: 1,
          district: 1,
          timeSpent: 1,
          visitedAt: 1,
          exitReason: 1,
          isSiteExit: 1,
        },
      },
      { $sort: { visitedAt: -1 } }, // latest visit first
    ]);

    if (!visits.length) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: visits });
  } catch (err) {
    console.error("User details error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
};

// GET /api/track/location-stats
export const getLocationStats = async (req, res) => {
  try {
    const locationStats = await PageVisit.aggregate([
      {
        $group: {
          _id: "$location",
          totalVisits: { $sum: 1 },
          totalTimeSpent: { $sum: "$timeSpent" },
          avgTimeSpent: { $avg: "$timeSpent" },
          uniqueUsers: { $addToSet: "$user" }, 
        },
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
          totalVisits: 1,
          totalTimeSpent: 1,
          avgTimeSpent: { $round: ["$avgTimeSpent", 2] },
          uniqueUsersCount: { $size: "$uniqueUsers" },
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    res.status(200).json({ success: true, data: locationStats });
  } catch (err) {
    console.error("Error fetching location stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
