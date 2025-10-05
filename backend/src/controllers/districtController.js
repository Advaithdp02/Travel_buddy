import District from "../models/District.js";
import Location from "../models/Location.js";

// Get all districts
export const getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find().populate("locations");
    res.json(districts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single district by ID
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

// Create a district
export const createDistrict = async (req, res) => {
  try {
    const { name, locations } = req.body;
    const district = new District({ name, locations });
    await district.save();
    res.status(201).json(district);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a location to a district
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
