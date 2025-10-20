import express from "express";
import multer from "multer";
import {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getNearestHotels,
} from "../controllers/hotelController.js";

import { protect, staffProtect } from "../middlewares/authMiddleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.get("/nearest/:locationId", getNearestHotels);

// Admin routes
router.post("/", protect, staffProtect, upload.array("images", 1), createHotel);
router.put("/:id", protect, staffProtect, upload.array("images", 1), updateHotel);
router.delete("/:id", protect, staffProtect, deleteHotel);

export default router;
