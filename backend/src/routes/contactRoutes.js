import express from "express";
import { contactUs } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", contactUs);

export default router;