import District from "../models/District.js";
import Location from "../models/Location.js";
import { uploadToS3 } from "./uploadController.js";

// 🟢 Get all districts
export const getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find().populate("locations");
    res.json(districts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Get single district by ID
export const getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate("locations");
    if (!district) return res.status(404).json({ message: "District not found" });
    res.json(district);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Create a district (supports image upload + coordinates + additional fields)
export const createDistrict = async (req, res) => {
  try {
    const { name, State, locations, coordinates, description, subtitle, points } = req.body;
    let imageURL = null;

    // Optional image upload
    if (req.file) {
      const folderName = `districts/${name}`;
      imageURL = await uploadToS3(req.file.buffer, req.file.originalname, folderName, req.file.mimetype);
    }

    const district = new District({
      name,
      State,
      locations: locations ? JSON.parse(locations) : [],
      imageURL,
      description: description || "",
      subtitle: subtitle || "",
      points: points ? JSON.parse(points) : [],
      coordinates: coordinates
        ? {
            type: "Point",
            coordinates: [
              parseFloat(coordinates.longitude),
              parseFloat(coordinates.latitude)
            ],
          }
        : undefined,
    });

    await district.save();
    res.status(201).json(district);
  } catch (err) {
    console.error("Create District Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Update district (name, image, coordinates, and new fields)
export const updateDistrict = async (req, res) => {
  try {
    const { name, State, coordinates, description, subtitle, points } = req.body;

    const district = await District.findById(req.params.id);
    if (!district) return res.status(404).json({ message: "District not found" });

    if (name) district.name = name;
    if (State) district.State = State;
    if (description) district.description = description;
    if (subtitle) district.subtitle = subtitle;
    if (points) district.points = JSON.parse(points);

    // Handle image update
    if (req.file) {
      const folderName = `districts/${district.name}`;
      const url = await uploadToS3(req.file.buffer, req.file.originalname, folderName, req.file.mimetype);
      district.imageURL = url;
    }

    // Handle coordinate update
    if (coordinates) {
      district.coordinates = {
        type: "Point",
        coordinates: [
          
          parseFloat(coordinates.longitude),
          parseFloat(coordinates.latitude)
        ],
      };
    }

    await district.save();
    res.json(district);
  } catch (err) {
    console.error("Update District Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 🟢 Add a location to a district
export const addLocationToDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) return res.status(404).json({ message: "District not found" });

    district.locations.push(req.body.locationId);
    await district.save();

    res.json(district);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// 🟢 Get nearest district by latitude and longitude
export const getNearestDistrict = async (req, res) => {
  try {
    const { lat, lon } = req.params;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const nearest = await District.findOne({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)], // [longitude, latitude]
          },
        },
      },
    }).populate("locations");

    if (!nearest) {
      return res.status(404).json({ message: "No nearby districts found" });
    }

    res.json(nearest);
  } catch (err) {
    console.error("Get Nearest District Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Get districts by State
export const getDistrictByState = async (req, res) => {
  try {
    const { state } = req.params;

    if (!state) {
      return res.status(400).json({ message: "State parameter is required" });
    }

    // Case-insensitive match for flexibility
    const districts = await District.find({
      State: { $regex: new RegExp(`^${state}$`, "i") },
    }).populate("locations");

    if (districts.length === 0) {
      return res.status(404).json({ message: "No districts found for this state" });
    }

    res.json(districts);
  } catch (err) {
    console.error("Get District By State Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
