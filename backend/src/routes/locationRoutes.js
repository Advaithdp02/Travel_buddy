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
  sendOTP,
  verifyOTP,
  bulkUpload,
} from "../controllers/locationController.js";
import { protect,staffProtect } from "../middlewares/authMiddleware.js";


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

// OTP routes
router.post("/bulk/send-otp", sendOTP);
router.post("/bulk/verify-otp", verifyOTP);

// Upload route
router.post("/bulk/upload", upload.single("file"), bulkUpload);

export default router;
