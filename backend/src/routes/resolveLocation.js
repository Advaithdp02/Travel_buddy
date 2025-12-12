import express from "express";
import mongoose from "mongoose";
import Location from "../models/Location.js";
import District from "../models/District.js";

const router = express.Router();

/**
 * GET /resolve-location/:id
 * Returns { locationName, districtName }
 */
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json({
      locationName: "Unknown Location",
      districtName: "N/A",
    });
  }

  try {
    // Try Location lookup
    const locationDoc = await Location.findById(id)
      .populate("district", "name")
      .select("name district");

    if (locationDoc) {
      return res.json({
        locationName: locationDoc.name || "Unknown Location",
        districtName: locationDoc.district?.name || "N/A",
      });
    }

    // Try District lookup
    const districtDoc = await District.findById(id).select("name");

    if (districtDoc) {
      return res.json({
        locationName: districtDoc.name || "Unknown District",
        districtName: districtDoc.name,
      });
    }

    // Not found
    return res.json({
      locationName: "Unknown Location",
      districtName: "N/A",
    });

  } catch (error) {
    console.error("resolve-location error:", error);
    return res.json({
      locationName: "Unknown Location",
      districtName: "N/A",
    });
  }
});

export default router;
