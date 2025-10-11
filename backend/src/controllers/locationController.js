import Location from "../models/Location.js";
import District from "../models/District.js";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";


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
    const { name, district, description, coordinates } = req.body;

    const dist = await District.findById(district);
    if (!dist) return res.status(404).json({ message: "District not found" });

    const folderName = `places/${dist.name}/${name}`;
    let images = [];

    console.log("Files received:", req.files); // should log an array of uploaded files

    // ✅ Upload images if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(
          file.buffer,
          file.originalname,
          folderName,
          file.mimetype
        );
        images.push(url);
      }
    }

    // ✅ Create new location
    const location = new Location({
      name,
      district,
      description,
      coordinates,
      images,
    });

    await location.save();

    // ✅ Add location reference to district
    dist.locations.push(location._id);
    await dist.save();

    res.status(201).json(location);
  } catch (err) {
    console.error("Create Location Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update location (Admin only)
export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate("district");
    if (!location) return res.status(404).json({ message: "Location not found" });

    const fieldsToUpdate = ["name", "description", "coordinates", "district"];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) location[field] = req.body[field];
    });

    const districtDoc = await District.findById(location.district);
    const folderName = `places/${districtDoc.name}/${location.name}`;

    console.log("Files received:", req.files); // <-- should log an array

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      // Delete old images from S3
      if (location.images?.length > 0) {
        for (const oldUrl of location.images) {
          await deleteFromS3(oldUrl);
        }
      }

      // Upload new ones
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

      console.log("Uploaded image URLs:", uploadedUrls);
      location.images = uploadedUrls;
    }

    // Handle explicit clearing of images
    if (req.body.images === "" || req.body.images === null) {
      if (location.images?.length > 0) {
        for (const oldUrl of location.images) {
          await deleteFromS3(oldUrl);
        }
      }
      location.images = [];
    }

    await location.save();
    res.json(location);
  } catch (err) {
    console.error("Update Location Error:", err);
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