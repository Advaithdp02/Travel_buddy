import Location from "../models/Location.js";
import District from "../models/District.js";

// Get all locations
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate("district");
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single location by ID
export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate("district")
      .populate("contributions")
      .populate("comments");

    if (!location) return res.status(404).json({ message: "Location not found" });
    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new location (Admin only)
export const createLocation = async (req, res) => {
  try {
    const { name, district, description, images, coordinates } = req.body;

    const location = new Location({
      name,
      district,
      description,
      images,
      coordinates,
    });

    await location.save();

    // Add location to district
    const dist = await District.findById(district);
    if (dist) {
      dist.locations.push(location._id);
      await dist.save();
    }

    res.status(201).json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
