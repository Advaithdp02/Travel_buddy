import express from "express";
import multer from "multer";
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
  getAllUsers,
  updateUserRole,
  deleteUser,
  getWishlist,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
  verifyToken,
} from "../controllers/userController.js";
import { protect,staffProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Setup multer to handle in-memory uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- AUTH ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// ---------------- PROFILE ----------------
router.get("/profile", protect, getUserProfile);

router.get("/verify", protect, verifyToken);

// ✅ Allow updating profile info + image uploads
router.put("/profile",protect,upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),updateUserProfile
);

// ---------------- OTHER USERS ----------------
router.get("/profile/:username", protect, getOtherUserProfile);

// ---------------- FOLLOW ----------------
router.put("/follow/:username", protect, toggleFollow);

// ---------------- WISHLIST ----------------
router.put("/wishlist/add/:locationId", protect, addToWishlist);
router.put("/wishlist/remove/:locationId", protect, removeFromWishlist);
router.get("/wishlist", protect, getWishlist);

// ---------------- TRACK LOCATION VISITS ----------------
// Handles both logged-in and anonymous users
router.put("/locations/track/:locationId", trackLocationVisit);

// Admin routes
router.get("/admin/users", protect, staffProtect, getAllUsers);
router.put("/admin/users/:id/role", protect, staffProtect, updateUserRole);
router.delete("/admin/users/:id", protect, staffProtect, deleteUser);

//forget password route

// POST: Request reset link
router.post("/forgot-password", requestPasswordReset);

// POST: Verify OTP
router.post("/verify-otp", verifyResetOTP);

// POST: Reset password
router.post("/reset-password", resetPassword);

export default router;
