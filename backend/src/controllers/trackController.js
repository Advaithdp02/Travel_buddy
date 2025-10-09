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
    const stats = await PageVisit.aggregate([
      {
        $group: {
          _id: "$path",
          totalVisits: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          totalTimeSpent: { $sum: "$timeSpent" }
        }
      },
      { $sort: { totalVisits: -1 } }
    ]);

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
