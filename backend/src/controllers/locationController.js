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
})

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
    const { name, district, description, coordinates,subtitle,points,terrain } = req.body;

    // Find district
    const dist = await District.findById(district);
    if (!dist) return res.status(404).json({ message: "District not found" });

    // Parse coordinates from frontend (string -> array)
    let coordinatesObj;
    if (coordinates) {
      let coordsArray;
      try {
        coordsArray = JSON.parse(coordinates);
      } catch (e) {
        return res.status(400).json({ message: "Invalid coordinates format" });
      }

      if (!Array.isArray(coordsArray) || coordsArray.length !== 2 || coordsArray.some(isNaN)) {
        return res.status(400).json({ message: "Coordinates must be an array of 2 numbers" });
      }

      coordinatesObj = { type: "Point", coordinates: coordsArray };
    } else {
      return res.status(400).json({ message: "Coordinates are required" });
    }

    const folderName = `places/${dist.name}/${name}`;
    let images = [];

    console.log("Files received:", req.files);

    // Upload images to S3 if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
        images.push(url);
      }
    }

    // Create location
    const location = new Location({
      name,
      district,
      description,
      subtitle,
      points,
      coordinates: coordinatesObj,
      images,
      terrain
    });

    await location.save();

    // Add location reference to district
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

    const { name, district, description, coordinates, images: clearImagesFlag ,subtitle,points,terrain} = req.body;

    // Update basic fields
    if (name) location.name = name;
    if (description) location.description = description;
    if (district) location.district = district;
    if (subtitle) location.subtitle = subtitle;
    if (points) location.points = points;
    if (terrain) location.terrain = terrain;

    // Update coordinates if provided
    if (coordinates) {
      let coordsArray;
      try {
        coordsArray = JSON.parse(coordinates);
      } catch (e) {
        return res.status(400).json({ message: "Invalid coordinates format" });
      }

      if (!Array.isArray(coordsArray) || coordsArray.length !== 2 || coordsArray.some(isNaN)) {
        return res.status(400).json({ message: "Coordinates must be an array of 2 numbers" });
      }

      location.coordinates = { type: "Point", coordinates: coordsArray };
    }

    const districtDoc = await District.findById(location.district);
    const folderName = `places/${districtDoc.name}/${location.name}`;

    console.log("Files received:", req.files);

    // Replace images if new files uploaded
    if (req.files && req.files.length > 0) {
      if (location.images?.length > 0) {
        for (const oldUrl of location.images) await deleteFromS3(oldUrl);
      }

      const uploadedUrls = [];
      for (const file of req.files) {
        const url = await uploadToS3(file.buffer, file.originalname, folderName, file.mimetype);
        uploadedUrls.push(url);
      }
      location.images = uploadedUrls;
    }

    // Clear images if requested
    if (clearImagesFlag === "" || clearImagesFlag === null) {
      if (location.images?.length > 0) {
        for (const oldUrl of location.images) await deleteFromS3(oldUrl);
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