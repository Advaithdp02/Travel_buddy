import express from "express";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";
import { createContribution, getContributionsByLocation, getContributionById, verifyContribution } from "../controllers/contributionController.js";

const router = express.Router();

// Create a contribution (logged-in user)
router.post("/", protect, createContribution);

// Get all verified contributions for a location
router.get("/location/:locationId", getContributionsByLocation);

// Get single contribution
router.get("/:id", getContributionById);

// Admin verifies a contribution
router.put("/verify/:id", protect, adminProtect, verifyContribution);

export default router;
