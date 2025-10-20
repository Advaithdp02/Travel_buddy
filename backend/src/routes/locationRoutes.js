import express from "express";
import multer from "multer";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllLocationsNoDistrict,
  getNearestLocation,
} from "../controllers/locationController.js";
import { protect,adminProtect, staffProtect } from "../middlewares/authMiddleware.js";


const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get("/district/:district", getAllLocations);
router.get("/:id", getLocationById);
router.get("/nearest/:lat/:lon", getNearestLocation);
router.get("/", getAllLocationsNoDistrict);

// Admin only
router.post("/", protect, staffProtect,upload.array("images", 10), createLocation);
router.put("/:id", protect, staffProtect,upload.array("images", 10), updateLocation);
router.delete("/:id", protect, staffProtect, deleteLocation);

export default router;
