import express from "express";
import { contactUs, sendOtp, verifyOtp } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", contactUs);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);


export default router;