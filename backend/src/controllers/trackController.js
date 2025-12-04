import PageVisit from "../models/PageVisit.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import District from "../models/District.js";
import mongoose from "mongoose";

const resolveLocation = async (url) => {
  if (!url) {
    return {
      locationName: "Unknown Location",
      districtName: "N/A",
    };
  }

  const clean = url.replace(/^\/+/, "");
  if (clean === "") {
    return {
      locationName: "Home",
      districtName: "N/A",
    };
  }

  const segments = clean.split("/");
  const base = segments[0];
  const lastSegment = segments[segments.length - 1];

  const NON_LOCATION_PAGES = [
    "admin",
    "login",
    "register",
    "account",
    "settings",
    "about",
    "contact",
    "help",
  ];
  // ⭐ Detect external URLs → do NOT resolve internally
if (url.startsWith("http://") || url.startsWith("https://")) {
  return {
    locationName: url,        // show full URL
    districtName: "External", // label as external
  };
}


  // ⭐ Profile special case
  if (base === "profile") {
    const username = segments[1];
    return {
      locationName: username ? `Profile: ${username}` : "Profile",
      districtName: "N/A",
    };
  }

  if (NON_LOCATION_PAGES.includes(base)) {
    return {
      locationName: base.charAt(0).toUpperCase() + base.slice(1),
      districtName: "N/A",
    };
  }

  // If not ObjectId → simple route
  if (!mongoose.Types.ObjectId.isValid(lastSegment)) {
    return {
      locationName: segments[1] || segments[0] || "Unknown Location",
      districtName: "N/A",
    };
  }

  try {
    const locationDoc = await Location.findById(lastSegment)
      .populate("district", "name")
      .select("name district");

    if (locationDoc) {
      return {
        locationName: locationDoc.name || "Unknown Location",
        districtName: locationDoc.district?.name || "",
      };
    }

    const districtDoc = await District.findById(lastSegment).select("name");

    if (districtDoc) {
      return {
        locationName: districtDoc.name,
        districtName: districtDoc.name,
      };
    }
  } catch (err) {
    console.log("resolveLocation error:", err);
  }

  return {
    locationName: segments[1] || segments[0] || "Unknown Location",
    districtName: "N/A",
  };
};


// -------------------- POST /api/track --------------------
export const trackVisit = async (req, res) => {
  try {
    const {
      user,
      sessionId,
      fromUrl,
      toUrl,
      actionType,
      exitReason,
      isSiteExit,
      timeSpent,
      isAnonymous,
      deviceInfo,
      geoLocation,
    } = req.body;

    // -----------------------------------------------
    // REQUIRED FIELDS CHECK
    // -----------------------------------------------
    if (!sessionId || !fromUrl || !actionType || timeSpent == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // DO NOT TRACK ADMIN NAVIGATION
    if (fromUrl.startsWith("/admin")) {
      return res.status(204).end();
    }

    // -----------------------------------------------
    // RESOLVE BOTH URLs → readable names
    // -----------------------------------------------
    const { locationName: fromLocation, districtName: fromDistrict } =
      await resolveLocation(fromUrl);

    const { locationName: toLocation, districtName: toDistrict } =
      await resolveLocation(toUrl);

    // -----------------------------------------------
    // GEO JSON FORMAT
    // -----------------------------------------------
    let geoJSON = null;
    if (geoLocation?.coordinates?.length === 2) {
      geoJSON = {
        type: "Point",
        coordinates: geoLocation.coordinates,
      };
    }

    // -----------------------------------------------
    // CREATE DATABASE RECORD
    // -----------------------------------------------
    const visit = await PageVisit.create({
      user: user || null,
      sessionId,
      fromUrl,
      toUrl,
      actionType,
      exitReason,
      isSiteExit: !!isSiteExit,
      timeSpent,
      isAnonymous,
      deviceInfo: deviceInfo || {},
      geoLocation: geoJSON,

      // PRIMARY location info (by default fromUrl)
      location: fromLocation,
      district: fromDistrict,

      // EXTRA readable values (for UI)
      fromLocation,
      toLocation,
      fromDistrict,
      toDistrict,
    });

    res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- POST /api/track/exit --------------------
export const recordExit = async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      location,
      timeSpent,
      exitReason,
      isSiteExit,
      hotelId,
      destinationUrl,
      geoLocation,
    } = req.body;

    if (!sessionId || !location) {
      return res
        .status(400)
        .json({ success: false, message: "Missing sessionId or location" });
    }

    let locationName =
      typeof location === "string" ? location : location.name || "";
    let districtName = "Unknown";

    try {
      let locationId = "";
      if (typeof location === "object" && location.id) locationId = location.id;
      else if (typeof location === "string") {
        const segments = location.split("/");
        const possibleId = segments[segments.length - 1];
        if (mongoose.Types.ObjectId.isValid(possibleId))
          locationId = possibleId;
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

    // --- Build GEO JSON ---
    let geoJSON = null;
    if (geoLocation?.coordinates?.length === 2) {
      geoJSON = {
        type: "Point",
        coordinates: geoLocation.coordinates,
      };
    }

    const visit = await PageVisit.create({
      user: userId || null,
      sessionId,
      location: locationName,
      district: districtName,
      timeSpent: timeSpent || 0,
      exitReason: exitReason || "unknown",
      isSiteExit: !!isSiteExit,
      isAnonymous: !userId,
      hotelId: hotelId || null,
      destinationUrl: destinationUrl || null,
      geoLocation: geoJSON,
    });

    res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("Exit tracking error:", err);
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
    const uniqueUsers = await PageVisit.distinct("user", {
      user: { $ne: null },
    });

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

// GET /api/track/user-stats

export const getUserStats = async (req, res) => {
  try {
    const { from, to } = req.query;

    const matchStage = {};
    if (from && to) {
      matchStage.visitedAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const stats = await PageVisit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$user",
          totalVisits: { $sum: 1 },
          totalTimeSpent: { $sum: "$timeSpent" },
          uniqueLocations: { $addToSet: "$location" },
          uniqueDistricts: { $addToSet: "$district" },
        },
      },
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user stats" });
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
          fromUrl: 1,
          toUrl: 1,
          actionType: 1,
          fromLocation: 1,
          toLocation: 1,
          fromDistrict: 1,
          toDistrict: 1,
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user details" });
  }
};

// GET /api/track/location-stats
export const getLocationStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const matchStage = {};
    if (from && to) {
      matchStage.visitedAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const locationStats = await PageVisit.aggregate([
      { $match: matchStage },
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
          avgTimeSpent: 1,
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

// GET /api/track/location-details/:location
export const getLocationDetails = async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res
        .status(400)
        .json({ success: false, message: "Location parameter is required" });
    }

    // Match visits for that specific location
    const visits = await PageVisit.aggregate([
      { $match: { location } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          _id: 0,
          username: {
            $cond: [
              { $gt: [{ $size: "$userInfo" }, 0] },
              { $arrayElemAt: ["$userInfo.username", 0] },
              "Anonymous",
            ],
          },
          visitedAt: 1,
          timeSpent: 1,
          exitReason: 1,
        },
      },
      { $sort: { visitedAt: -1 } }, // newest first
    ]);

    res.json({ success: true, data: visits });
  } catch (err) {
    console.error("Error fetching location details:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch location details" });
  }
};
// GET /api/track/hotel-stats
export const getHotelStats = async (req, res) => {
  try {
    const stats = await PageVisit.aggregate([
      { $match: { hotelId: { $ne: null } } }, // only track visits tied to a hotel
      {
        $group: {
          _id: "$hotelId",
          totalVisits: { $sum: 1 },
          avgTimeSpent: { $avg: "$timeSpent" },
          totalTimeSpent: { $sum: "$timeSpent" },
          externalClicks: {
            $sum: {
              $cond: [{ $eq: ["$isSiteExit", true] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelInfo",
        },
      },
      {
        $project: {
          _id: 0,
          hotelId: "$_id",
          hotelName: { $arrayElemAt: ["$hotelInfo.name", 0] },
          totalVisits: 1,
          avgTimeSpent: 1,
          totalTimeSpent: 1,
          externalClicks: 1,
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error fetching hotel stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// GET /api/track/hotel-details/:hotelId
export const getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid hotelId" });
    }

    const details = await PageVisit.aggregate([
      { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },

      // Join with User collection to get username
      {
        $lookup: {
          from: "users", // MongoDB collection name for users
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

      // Group by user
      {
        $group: {
          _id: "$user", // user ObjectId (null for anonymous)
          username: { $first: "$userInfo.username" }, // now populated
          totalClicks: { $sum: 1 },
          locations: {
            $push: {
              location: "$location",
              district: "$district",
              timeSpent: "$timeSpent",
              exitReason: "$exitReason",
              visitedAt: "$visitedAt",
              isSiteExit: "$isSiteExit",
              destinationUrl: "$destinationUrl",
            },
          },
        },
      },

      { $sort: { totalClicks: -1 } },
    ]);

    res.status(200).json({ success: true, data: details });
  } catch (err) {
    console.error("Error fetching hotel details:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/track/top-hotels
export const getTopHotels = async (req, res) => {
  try {
    const topHotels = await PageVisit.aggregate([
      { $match: { hotelId: { $ne: null } } },
      { $group: { _id: "$hotelId", totalVisits: { $sum: 1 } } },
      { $sort: { totalVisits: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelInfo",
        },
      },
      {
        $project: {
          _id: 0,
          hotelId: "$_id",
          name: { $arrayElemAt: ["$hotelInfo.name", 0] },
          totalVisits: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: topHotels });
  } catch (err) {
    console.error("Top hotels error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch top hotels" });
  }
};

export const getGeoStats = async (req, res) => {
  try {
    const latestVisits = await PageVisit.aggregate([
      {
        // Sort by newest visit first
        $sort: { visitedAt: -1 },
      },
      {
        // Group by user – take the MOST RECENT visit (first after sorting)
        $group: {
          _id: "$user",
          user: { $first: "$user" },
          location: { $first: "$location" },
          district: { $first: "$district" },
          timeSpent: { $first: "$timeSpent" },
          exitReason: { $first: "$exitReason" },
          visitedAt: { $first: "$visitedAt" },
          geoLocation: { $first: "$geoLocation" }, // KEEP AS-IS (even if null)
        },
      },
    ]);

    // Populate user info (username/name)
    const populated = await PageVisit.populate(latestVisits, {
      path: "user",
      select: "username name",
    });

    // Final response format
    const result = populated.map((v) => ({
      username: v.user?.username || v.user?.name || "Anonymous",
      location: v.location,
      district: v.district,
      timeSpent: v.timeSpent,
      exitReason: v.exitReason,
      visitedAt: v.visitedAt,
      geoLocation: v.geoLocation,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Geo Stats Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load geo stats",
    });
  }
};

export const getAllLocationGeoStats = async (req, res) => {
  try {
    const locations = await Location.find({}).populate(
      "district",
      "name districtCode"
    );

    const result = locations.map((loc) => ({
      name: loc.name,
      subtitle: loc.subtitle,
      description: loc.description,
      district: loc.district?.name || "Unknown",
      districtCode: loc.district?.districtCode || null,
      terrain: loc.terrain,
      coordinates: loc.coordinates, // GeoJSON
      images: loc.images,
      review: loc.review,
      reviewLength: loc.reviewLength,
      points: loc.points,
      policeStation: loc.policeStation,
      ambulance: loc.ambulance,
      localSupport: loc.localSupport,
      roadSideAssistant: loc.roadSideAssistant,
      createdAt: loc.createdAt,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Location Geo Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load all locations",
    });
  }
};

export const getAllVisits = async (req, res) => {
  try {
    const { from, to } = req.query;

    // If no dates provided → default = all
    const fromDate = from ? new Date(from) : new Date("1970-01-01");
    const toDate = to ? new Date(to) : new Date();

    const visits = await PageVisit.find({
      visitedAt: { 
        $gte: fromDate,
        $lte: toDate
      }
    })
      .populate("user", "username")
      .sort({ visitedAt: 1 });

    const formatted = visits.map(v => ({
      username: v.user?.username || "Anonymous",
      visitedAt: v.visitedAt,
      fromLocation: v.fromLocation,
      fromDistrict: v.fromDistrict,
      toLocation: v.toLocation,
      toDistrict: v.toDistrict,
      timeSpent: v.timeSpent,
      exitReason: v.exitReason,

      // Easy-to-read flow
      flow: v.toLocation
        ? `${v.fromLocation} → ${v.toLocation}`
        : `${v.fromLocation} → EXIT`
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Get all visits error:", err);
    res.status(500).json({ success: false });
  }
};
// GET /track/live
export const getLiveUsers = async (req, res) => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 60 * 1000); // last 60 sec

    const live = await PageVisit.aggregate([
      {
        $match: {
          visitedAt: { $gte: cutoff },
          isSiteExit: false, // not exited yet
        },
      },
      {
        $group: {
          _id: "$sessionId",
          username: { $first: "$user" },
          lastVisitedAt: { $max: "$visitedAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "username",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          sessionId: "$_id",
          username: { $arrayElemAt: ["$userDetails.username", 0] },
          lastVisitedAt: 1,
        },
      },
    ]);

    res.json({ success: true, liveUsers: live });
  } catch (err) {
    console.error("Live users error:", err);
    res.status(500).json({ success: false });
  }
};
