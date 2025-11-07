import express from "express";
import {
  protect,
  adminProtect,
  staffProtect,
} from "../middlewares/authMiddleware.js";
import {
  createContribution,
  getContributionsByLocation,
  getContributionById,
  verifyContribution,
  getAllContributions,
  deleteContribution,
  getContributionsByUser,
  getContributionComments,
  addContributionComment,
  toggleContributionCommentLike,
  toggleContributionLike,
  getContributionsForDistrict,
  contributionCommentDelete,
} from "../controllers/contributionController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a contribution (logged-in user)
router.post(
  "/",
  protect,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createContribution
);

router.get("/user", protect, getContributionsByUser);

// Get all verified contributions for a location
router.get("/location/:locationId", getContributionsByLocation);

// Get single contribution
router.get("/:id", getContributionById);

// Admin verifies a contribution
router.put("/verify/:id", protect, staffProtect, verifyContribution);

// Comments on a contribution
router.get("/:id/comments", getContributionComments); // get all comments for a contribution
router.post("/:id/comments", protect, addContributionComment); // add comment to a contribution
router.put(
  "/:contribId/comments/like/:commentId",
  protect,
  toggleContributionCommentLike
); // like/unlike a comment
router.put("/:id/like", protect, toggleContributionLike); // like/unlike a contribution
router.get("/district/:id", getContributionsForDistrict);
router.delete(
  "/:contribId/comments/:commentId",
  protect,
  contributionCommentDelete
); // delete a commen

// ✅ Admin: Get all contributions
router.get("/", protect, staffProtect, getAllContributions);
router.delete("/:id", protect, staffProtect, deleteContribution);

export default router;
