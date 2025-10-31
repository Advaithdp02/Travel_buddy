import express from "express";
import { trackVisit, getStats, recordExit, getUserStats, getUserDetails, getLocationStats } from "../controllers/trackController.js";

const router = express.Router();

// Track a page visit
router.post("/", trackVisit);

// Optional: Analytics endpoint
router.get("/stats", getStats);


router.get("/user-stats", getUserStats);
router.get("/user-details/:userId", getUserDetails);
router.get("/location-stats", getLocationStats);


router.post("/exit", recordExit);

export default router;
