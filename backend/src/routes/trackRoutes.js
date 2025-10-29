import express from "express";
import { trackVisit, getStats, recordExit } from "../controllers/trackController.js";

const router = express.Router();

// Track a page visit
router.post("/", trackVisit);

// Optional: Analytics endpoint
router.get("/stats", getStats);


router.post("/exit", recordExit);

export default router;
