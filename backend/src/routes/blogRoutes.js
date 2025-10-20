import express from "express";
import multer from "multer";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { protect, staffProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// For image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get("/", getAllBlogs);       // Get all blogs
router.get("/:slug", getBlogBySlug); // Get blog by slug

// Admin / Staff routes
router.post("/", protect, staffProtect, upload.single("image"), createBlog);
router.put("/:id", protect, staffProtect, upload.single("image"), updateBlog);
router.delete("/:id", protect, staffProtect, deleteBlog);

export default router;
