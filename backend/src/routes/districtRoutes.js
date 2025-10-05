import express from "express";
import {
  getAllDistricts,
  getDistrictById,
  createDistrict,
  addLocationToDistrict,
} from "../controllers/districtController.js";
import { protect,adminProtect } from "../middlewares/authMiddleware.js";


const router = express.Router();

// Public routes
router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);

// Admin-only routes
router.post("/", protect, adminProtect, createDistrict);
router.put("/:id/location", protect, adminProtect, addLocationToDistrict);

export default router;
