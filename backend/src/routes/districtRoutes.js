import express from "express";
import {
  getAllDistricts,
  getDistrictById,
  createDistrict,
  addLocationToDistrict,
  updateDistrict,
} from "../controllers/districtController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);

// Admin-only routes
router.post("/", protect, adminProtect, createDistrict);
router.put("/:id/location", protect, adminProtect, addLocationToDistrict);

// Update district with single image (protected)
router.put("/:id", protect, adminProtect, upload.single("image"), updateDistrict);

export default router;
