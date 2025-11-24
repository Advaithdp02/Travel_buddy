import Hotel from "../models/Hotel.js";
import Location from "../models/Location.js";
import District from "../models/District.js";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";
import mongoose from "mongoose";

// ------------------ Get all hotels ------------------
export const getAllHotels = async (req, res) => {
  try {
    let { page = 1, limit = 9, districtId, state } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (districtId) filter.district = districtId;
    if (state) filter.State = state;

    const total = await Hotel.countDocuments(filter);

    const hotels = await Hotel.find(filter)
      .populate("district", "name State")
      .populate({
        path: "locationId",
        select: "name",
        strictPopulate: false,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    const hotelsFormatted = hotels.map((h) => ({
      ...h.toObject(),
      locationName: h.locationId?.name || h.location,
    }));

    res.status(200).json({
      hotels: hotelsFormatted,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("Fetch Hotels Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ------------------ Get single hotel by ID ------------------
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("district")
      .populate("locationId");
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ------------------ Create Hotel ------------------
export const createHotel = async (req, res) => {
  try {
    const { name, location, district, coordinates, link } = req.body;

    // Validate district
    let dist = null;
    if (mongoose.Types.ObjectId.isValid(district)) {
      dist = await District.findById(district);
    }
    if (!dist) {
      dist = await District.findOne({ name: district });
    }
    if (!dist) return res.status(404).json({ message: "District not found" });

    // Handle image upload
    let imgUrl = "";
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const folderName = `hotels/${dist.name}/${name}`;
      imgUrl = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
    }

    // Parse coordinates
    let coords = { type: "Point", coordinates: [0, 0], link: "" };
    if (coordinates) {
      if (typeof coordinates === "string") {
        try {
          coords = JSON.parse(coordinates);
        } catch (err) {
          return res.status(400).json({ message: "Invalid coordinates format" });
        }
      } else if (typeof coordinates === "object") {
        coords = coordinates;
      } else {
        return res.status(400).json({ message: "Invalid coordinates format" });
      }
    }

    // Attach link if provided
    if (link) coords.link = link;

    const hotel = new Hotel({
      name,
      location,
      district: dist._id,
      coordinates: coords,
      img: imgUrl,
    });

    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    console.error("Create Hotel Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ Update Hotel ------------------
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const { name, location, district, coordinates, link } = req.body;

    if (name) hotel.name = name;
    if (location) hotel.location = location;
    if (district) {
      if (mongoose.Types.ObjectId.isValid(district)) {
        hotel.district = district;
      } else {
        const distDoc = await District.findOne({ name: district });
        if (distDoc) hotel.district = distDoc._id;
      }
    }

    if (coordinates) {
      const parsedCoords = typeof coordinates === "string" ? JSON.parse(coordinates) : coordinates;
      hotel.coordinates = {
        type: parsedCoords.type || "Point",
        coordinates: parsedCoords.coordinates || [0, 0],
        link: link || parsedCoords.link || "",
      };
    } else if (link) {
      hotel.coordinates.link = link;
    }

    // Handle new image upload
    if (req.files && req.files.length > 0) {
      if (hotel.img) await deleteFromS3(hotel.img);
      const folderName = `hotels/${district || hotel.district}/${name || hotel.name}`;
      const file = req.files[0];
      hotel.img = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
    }

    await hotel.save();
    res.json(hotel);
  } catch (err) {
    console.error("Update Hotel Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ Delete hotel ------------------
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.img) await deleteFromS3(hotel.img);

    res.json({ message: "Hotel deleted" });
  } catch (err) {
    console.error("Delete Hotel Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ Get nearest hotels by location ID ------------------
export const getNearestHotels = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { maxDistance = 5000, skip = 0, limit = 10 } = req.query;

    // 1️⃣ Find the location
    const loc = await Location.findById(locationId).populate("district");
    if (!loc) return res.status(404).json({ message: "Location not found" });

    // 2️⃣ Try finding hotels near coordinates
    let hotels = await Hotel.find({
      coordinates: {
        $near: {
          $geometry: { type: "Point", coordinates: loc.coordinates.coordinates },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("district")
      .populate("locationId");

    // 3️⃣ If no hotels found, fallback to district
    if (!hotels.length) {
      hotels = await Hotel.find({ district: loc.district._id })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate("district")
        .populate("locationId");
    }

    res.json(hotels);
  } catch (err) {
    console.error("Fetch nearest hotels error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

