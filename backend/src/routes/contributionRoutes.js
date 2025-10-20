import express from "express";
import { protect, adminProtect, staffProtect } from "../middlewares/authMiddleware.js";
import { createContribution, getContributionsByLocation, getContributionById, verifyContribution, getAllContributions, deleteContribution } from "../controllers/contributionController.js";

const router = express.Router();

// Create a contribution (logged-in user)
router.post("/", protect, createContribution);

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
