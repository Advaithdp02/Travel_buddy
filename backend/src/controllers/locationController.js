import Location from "../models/Location.js";
import District from "../models/District.js";

// Get all locations
export const getAllLocations = async (req, res) => {
  try {
    const { district } = req.params;

    // Find the district document by name first
    const districtDoc = await District.findOne({ name: district });
    if (!districtDoc) {
      return res.status(404).json({ message: "District not found" });
    }

    // Now get all locations under this district
    const locations = await Location.find({ district: districtDoc._id }).populate("district");
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    }).populate("district");

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
    const location = await Location.findById(req.params.id);

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

export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return res.status(404).json({ message: "Location not found" });
    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    // Remove location from district
    const dist = await District.findById(location.district);
    if (dist) {
      dist.locations = dist.locations.filter((locId) => locId.toString() !== location._id.toString());
      await dist.save();
    }

    res.json({ message: "Location deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};