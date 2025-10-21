import express from "express";
import { protect, adminProtect, staffProtect } from "../middlewares/authMiddleware.js";
import { createContribution, getContributionsByLocation, getContributionById, verifyContribution, getAllContributions, deleteContribution, getContributionsByUser } from "../controllers/contributionController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a contribution (logged-in user)
router.post("/", protect, upload.fields([{ name: "images", maxCount: 10 },{ name: "coverImage", maxCount: 1 }]),createContribution);


router.get("/user", protect, getContributionsByUser);

// Get all verified contributions for a location
router.get("/location/:locationId", getContributionsByLocation);

// Get single contribution
router.get("/:id", getContributionById);

// Admin verifies a contribution
router.put("/verify/:id", protect, staffProtect, verifyContribution);

// ✅ Admin: Get all contributions
router.get("/", protect, staffProtect, getAllContributions);
router.delete("/:id", protect, staffProtect, deleteContribution);

export default router;
