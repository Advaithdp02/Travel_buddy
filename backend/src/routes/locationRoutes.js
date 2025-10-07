import express from "express";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearestLocation,
} from "../controllers/locationController.js";
import { protect,adminProtect } from "../middlewares/authMiddleware.js";


const router = express.Router();

// Public routes
router.get("/:district", getAllLocations);
router.get("/:id", getLocationById);
router.get("/nearest/:lat/:lon", getNearestLocation);

// Admin only
router.post("/", protect, adminProtect, createLocation);
router.put("/:id", protect, adminProtect, updateLocation);
router.delete("/:id", protect, adminProtect, deleteLocation);

export default router;
