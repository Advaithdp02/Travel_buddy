import express from "express";
import {
  getAllLocations,
  getLocationById,
  createLocation,
} from "../controllers/locationController.js";
import { protect,adminProtect } from "../middlewares/authMiddleware.js";


const router = express.Router();

// Public routes
router.get("/", getAllLocations);
router.get("/:id", getLocationById);

// Admin only
router.post("/", protect, adminProtect, createLocation);

export default router;
