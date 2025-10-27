import express from "express";
import multer from "multer";
import {
  getAllDistricts,
  getDistrictById,
  createDistrict,
  addLocationToDistrict,
  updateDistrict,
  getNearestDistrict,
  getDistrictByState, 
} from "../controllers/districtController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Use memory storage for S3 upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🟢 Public routes
router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);
router.get("/state/:state", getDistrictByState); 

// ✅ Get nearest district by coordinates (Public)
router.get("/nearest/:lat/:lon", getNearestDistrict);

// 🔒 Admin-only routes
router.post("/", protect, adminProtect, upload.single("image"), createDistrict);
router.put("/:id/location", protect, adminProtect, addLocationToDistrict);
router.put("/:id", protect, adminProtect, upload.single("image"), updateDistrict);

export default router;
