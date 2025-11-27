import Location from "../models/Location.js";
import District from "../models/District.js";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";
import nodemailer from "nodemailer";
import XLSX from "xlsx";


let otpStore = {};


// Get all locations
export const getAllLocations = async (req, res) => {
  try {
    const { district } = req.params;  // e.g., Kannur
    const { terrain } = req.query;    // e.g., Beach, Mountain

    if (!district) {
      return res.status(400).json({ message: "District parameter is required" });
    }

    // Detect ObjectId or name
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(district);

    let districtDoc;
    if (isObjectId) {
      districtDoc = await District.findById(district);
    } else {
      districtDoc = await District.findOne({
        name: { $regex: new RegExp(`^${district}$`, "i") },
      });
    }

    if (!districtDoc) {
      return res.status(404).json({ message: "District not found" });
    }

    // Base query
    const query = { district: districtDoc._id };

    // Escape regex special chars
    const escapeRegex = (str) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Add terrain filter (partial match, case-insensitive)
    if (terrain && terrain.trim() !== "") {
      query.terrain = {
        $regex: escapeRegex(terrain),
        $options: "i",
      };
    }

    // Fetch locations
    const locations = await Location.find(query).populate("district");

    return res.status(200).json(locations || []);
  } catch (err) {
    console.error("❌ Error fetching locations:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};





export const getAllLocationsNoDistrict = async (req, res) => {
  try {
    const locations = await Location.find().populate("district").populate("comments").populate("contributions");
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNearestLocation = async (req, res) => {
  try {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const nearest = await Location.findOne({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)] // [lon, lat]
          }
        }
      }
    }).populate("district")
    .populate("contributions") 
      .populate("comments"); ;

    if (!nearest) {
      return res.status(404).json({ message: "No nearby locations found" });
    }

    res.json(nearest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get single location by ID
export const getLocationById = async (req, res) => {
  try {
    // Find the location by ID
    const location = await Location.findById(req.params.id).populate({
  path: "contributions",
  populate: { path: "user", select: "username name profilePic" }
}).populate({
  path: "comments",
  populate: { path: "user", select: "username name profilePic" }
}).populate("district");

    // Check if it exists
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Send the raw location object as stored in MongoDB
    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Create new location (Admin only)
export const createLocation = async (req, res) => {
  try {
    const {
      name,
      district,
      description,
      subtitle,
      points,
      terrain,
      review,
      reviewLength,
      coordinates,
      roadSideAssistant,
      policeStation,
      ambulance,
      localSupport,
    } = req.body;

    // Validate district
    const dist = await District.findById(district);
    if (!dist) return res.status(404).json({ message: "District not found" });

    // Parse coordinates
    let coordinatesObj;
    if (coordinates) {
      let coordsArray;

      try {
        coordsArray = JSON.parse(coordinates);
      } catch (err) {
        return res.status(400).json({ message: "Invalid coordinates format" });
      }

      if (!Array.isArray(coordsArray) || coordsArray.length !== 2 || coordsArray.some(isNaN)) {
        return res.status(400).json({ message: "Coordinates must be [lng, lat]" });
      }

      coordinatesObj = { type: "Point", coordinates: coordsArray };
    } else {
      return res.status(400).json({ message: "Coordinates are required" });
    }

    // Upload images
    const folderName = `places/${dist.name}/${name}`;
    let images = [];

    if (req.files?.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
        images.push(url);
      }
    }

    // Create Location
    const location = new Location({
      name,
      district,
      description,
      subtitle,
      points,
      terrain,
      review,
      reviewLength,
      coordinates: coordinatesObj,
      images,

      // NEW FIELDS
      roadSideAssistant,
      policeStation,
      ambulance,
      localSupport,
    });

    await location.save();

    // Save to District
    dist.locations.push(location._id);
    await dist.save();

    res.status(201).json(location);
  } catch (err) {
    console.error("Create Location Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ====================== UPDATE LOCATION ======================
export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate("district");
    if (!location) return res.status(404).json({ message: "Location not found" });

    const oldDistrictId = location.district?._id?.toString();

    const {
      name,
      district,
      description,
      subtitle,
      points,
      terrain,
      review,
      reviewLength,
      coordinates,
      roadSideAssistant,
      policeStation,
      ambulance,
      localSupport,
      clearImagesFlag,
      deletedImages,
    } = req.body;

    // ========== BASIC FIELDS ==========
    if (name) location.name = name;
    if (description) location.description = description;
    if (district) location.district = district;
    if (subtitle) location.subtitle = subtitle;
    if (points) location.points = points;
    if (terrain) location.terrain = terrain;
    if (review) location.review = review;
    if (reviewLength) location.reviewLength = reviewLength;

    // ========== NEW EMERGENCY FIELDS ==========
    if (roadSideAssistant !== undefined) location.roadSideAssistant = roadSideAssistant;
    if (policeStation !== undefined) location.policeStation = policeStation;
    if (ambulance !== undefined) location.ambulance = ambulance;
    if (localSupport !== undefined) location.localSupport = localSupport;

    // ========== UPDATE COORDINATES ==========
    if (coordinates && coordinates !== "[]" && coordinates !== "[null,null]") {
      let coordsArray;

      try {
        coordsArray = JSON.parse(coordinates);
      } catch (err) {
        return res.status(400).json({ message: "Invalid coordinates format" });
      }

      if (
        !Array.isArray(coordsArray) ||
        coordsArray.length !== 2 ||
        coordsArray.some((v) => typeof v !== "number" || isNaN(v))
      ) {
        return res
          .status(400)
          .json({ message: "Coordinates must be two valid numbers [lng, lat]" });
      }

      location.coordinates = { type: "Point", coordinates: coordsArray };
    }

    // =====================================================================
    // =========================   IMAGE HANDLING   =========================
    // =====================================================================

    // ========== DELETE SELECTED IMAGES ==========
    if (deletedImages) {
      let toDelete = [];

      try {
        toDelete = JSON.parse(deletedImages);
      } catch {
        return res.status(400).json({ message: "Invalid deletedImages format" });
      }

      if (Array.isArray(toDelete)) {
        for (const imgUrl of toDelete) {
          await deleteFromS3(imgUrl);
        }

        // Remove from DB
        location.images = location.images.filter((img) => !toDelete.includes(img));
      }
    }

    // ========== UPLOAD NEW FILES (APPEND) ==========
    if (req.files?.length > 0) {
      const districtDoc = await District.findById(location.district);
      const folderName = `places/${districtDoc.name}/${location.name}`;

      const uploadedUrls = [];

      for (const file of req.files) {
        const url = await uploadToS3(
          file.buffer,
          file.originalname,
          folderName,
          file.mimetype
        );
        uploadedUrls.push(url);
      }

      // Append new images instead of replacing old ones
      location.images = [...location.images, ...uploadedUrls];
    }

    // ========== CLEAR ALL IMAGES (ONLY IF EXPLICIT TRUE) ==========
    if (clearImagesFlag === "true") {
      for (const oldUrl of location.images) {
        await deleteFromS3(oldUrl);
      }
      location.images = [];
    }

    // =====================================================================
    // ======================= END IMAGE HANDLING ===========================
    // =====================================================================

    await location.save();

    // ========== DISTRICT REASSIGNMENT LOGIC ==========
    const newDistrictId = location.district.toString();

    if (oldDistrictId !== newDistrictId) {
      await District.findByIdAndUpdate(oldDistrictId, {
        $pull: { locations: location._id },
      });

      await District.findByIdAndUpdate(newDistrictId, {
        $addToSet: { locations: location._id },
      });
    }

    res.json(location);
  } catch (err) {
    console.error("Update Location Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};






export const deleteLocation = async (req, res) => {
  try {
    // Find the location first
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    // Delete images from S3
    if (location.images?.length > 0) {
      for (const imgUrl of location.images) {
        await deleteFromS3(imgUrl);
      }
    }

    // Remove location reference from district
    const dist = await District.findById(location.district);
    if (dist) {
      dist.locations = dist.locations.filter(
        (locId) => locId.toString() !== location._id.toString()
      );
      await dist.save();
    }

    // Finally, delete the location document
    await Location.findByIdAndDelete(req.params.id);

    

    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    console.error("Delete Location Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const bulkUpload = async (req, res) => {
  try {
    console.log("Bulk upload started...");

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { districtId } = req.body;
    if (!districtId) return res.status(400).json({ error: "districtId missing" });

    // Read Excel/CSV/JSON
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const item of data) {
      const payload = {
        name: item.name,
        district: districtId,
        description: item.description || "",
        subtitle: item.subtitle || "",
        terrain: item.terrain || "",
        review: item.review || 0,
        reviewLength: item.reviewLength || 0,
        points: item.points ? item.points.split(";") : [],
        coordinates: {
          type: "Point",
          coordinates: [item.longitude, item.latitude],
        },
      };

      const existing = await Location.findOne({ name: item.name });

      if (existing) {
        await Location.updateOne({ _id: existing._id }, { $set: payload });
      } else {
        await Location.create(payload);
      }
    }

    res.json({ success: true, message: "Bulk upload completed" });

  } catch (err) {
    console.log("FATAL bulk upload error:", err);
    res.status(500).json({ error: "Bulk upload failed" });
  }
};


export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record)
    return res.json({ success: false, message: "OTP not sent" });

  if (Date.now() > record.expires)
    return res.json({ success: false, message: "OTP expired" });

  if (record.otp !== otp)
    return res.json({ success: false, message: "Invalid OTP" });

  return res.json({ success: true });
};
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TravelBuddy Bulk Upload OTP",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  res.json({ success: true, message: "OTP sent" });
};
