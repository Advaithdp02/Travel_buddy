import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getOtherUserProfile,
  toggleFollow,
  addToWishlist,
  removeFromWishlist,
  trackLocationVisit,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ---------------- AUTH ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// ---------------- PROFILE ----------------
router.get("/profile", protect, getUserProfile);      
router.put("/profile", protect, updateUserProfile);  // Update logged-in user profile

// ---------------- OTHER USERS ----------------
router.get("/profile/:username", protect, getOtherUserProfile);    // View another user’s profile

// ---------------- FOLLOW ----------------
router.put("/follow/:username", protect, toggleFollow);   // Follow/unfollow another user

// ---------------- WISHLIST ----------------
router.put("/wishlist/add/:locationId", protect, addToWishlist);
router.put("/wishlist/remove/:locationId", protect, removeFromWishlist);

// ---------------- TRACK LOCATION VISITS ----------------
// Handles both logged-in and anonymous users
router.put("/locations/track/:locationId", trackLocationVisit);

export default router;
