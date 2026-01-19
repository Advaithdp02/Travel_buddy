import express from "express";
import {
  getContributionCount,
  getLocationCount,
  getTopContributors,
} from "../controllers/serviceController.js";

import { protect, staffProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/countLocation", protect, staffProtect, getLocationCount);

router.get("/countContribution", protect, staffProtect, getContributionCount);

router.get("/top", protect, staffProtect, getTopContributors);

export default router;
