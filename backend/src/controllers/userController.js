import User from "../models/User.js";
import Location from "../models/Location.js";
import Contribution from "../models/Contribution.js";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AnonymousVisit from "../models/AnonymousVisit.js";

// -------------------- REGISTER --------------------
export const registerUser = async (req, res) => {
  try {
    const { name, username, password, location, dob, phone , email } = req.body;

    // Check required fields
    if (!name || !username || !password || !location || !dob || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    // Create new user
    const user = await User.create({
      name,
      username,
      password,
      location,
      dob,
      phone,
      email,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        location: user.location,
        dob: user.dob,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- LOGIN --------------------
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; 
    

    // Find user by username OR email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        location: user.location,
        dob: user.dob,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- FOLLOW / UNFOLLOW --------------------
export const toggleFollow = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findOne({ username });
    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    if (targetUser._id.toString() === currentUserId)
      return res.status(400).json({ message: "Cannot follow yourself" });

    const currentUser = await User.findById(currentUserId);

    if (currentUser.following.includes(targetUser._id)) {
      // Unfollow
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "Follow status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// -------------------- GET USER PROFILE --------------------
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
  .select("-password") // exclude password
  .populate("followers", "username profilePic")
  .populate("following", "username profilePic")
  .populate({
    path: "wishlist",
    select: "_id name district images",
    populate: {
      path: "district",
      select: "name", 
    },
  });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- UPDATE USER PROFILE --------------------
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const folderName = `users/${user.username}`;

    // ---------- PROFILE PICTURE ----------
    if (req.files?.profilePic?.[0]) {
      // New file uploaded → delete old and upload new
      if (user.profilePic) await deleteFromS3(user.profilePic);

      const file = req.files.profilePic[0];
      user.profilePic = await uploadToS3(
        file.buffer,
        file.originalname,
        `${folderName}/profilePics`,
        file.mimetype
      );
    } else if (req.body.profilePic === "" || req.body.profilePic === null || req.body.removeProfile === "true") {
      // User removed profile pic → delete old and set null
      if (user.profilePic) await deleteFromS3(user.profilePic);
      user.profilePic = null;
    }
    // else → user kept existing image, do nothing

    // ---------- COVER PHOTO ----------
    if (req.files?.coverPhoto?.[0]) {
      if (user.coverPhoto) await deleteFromS3(user.coverPhoto);

      const file = req.files.coverPhoto[0];
      user.coverPhoto = await uploadToS3(
        file.buffer,
        file.originalname,
        `${folderName}/coverPhotos`,
        file.mimetype
      );
    } else if (req.body.coverPhoto === "" || req.body.coverPhoto === null || req.body.removeCover === "true") {
      if (user.coverPhoto) await deleteFromS3(user.coverPhoto);
      user.coverPhoto = null;
    }

    // ---------- TEXT FIELDS ----------
    const fieldsToUpdate = [
      "name",
      "username",
      "location",
      "dob",
      "phone",
      "gender",
      "occupation",
      "relationshipStatus",
      "bio",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: user.toObject({ getters: true, virtuals: false, versionKey: false }),
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: err.message });
  }
};

 
export const getOtherUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic")
      .populate({
        path: "contributions",
        select: "title description images likes comments verified createdAt",
        match: { verified: true }, // only verified contributions
        populate: [
          { path: "likes", select: "username profilePic" }, // populate likes with username & profilePic
          { path: "comments", select: "user text createdAt", populate: { path: "user", select: "username profilePic" } } // nested populate
        ]
      })
      .populate({
    path: "wishlist",
    select: "_id name district images",
    populate: {
      path: "district",
      select: "name", 
    },
  });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- WISHLIST MANAGEMENT --------------------
export const addToWishlist = async (req, res) => {
  try {
    const { locationId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(locationId)) {
      user.wishlist.push(locationId);
      await user.save();
    }

    res.json({
      message: "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//--------------------- REMOVE FROM WISHLIST --------------------
export const removeFromWishlist = async (req, res) => {
  try {
    const { locationId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist.pull(locationId); // removes if exists
    await user.save();

    res.json({
      message: "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- TRACK LOCATION VISIT --------------------

export const trackLocationVisit = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { timeSpent, anonId } = req.body;

    if (req.user) {
      // Logged-in user
      const user = await User.findById(req.user.id);
      const visit = user.locationsVisited.find(
        (v) => v.locationId.toString() === locationId
      );

      if (visit) visit.timeSpent += timeSpent;
      else user.locationsVisited.push({ locationId, timeSpent });

      await user.save();
      return res.json({ message: "User visit tracked", userId: user._id });
    }

    if (anonId) {
      // Anonymous user
      let visit = await AnonymousVisit.findOne({ anonId, locationId });

      if (visit) {
        visit.timeSpent += timeSpent;
        visit.lastVisited = Date.now();
      } else {
        visit = new AnonymousVisit({ anonId, locationId, timeSpent });
      }

      await visit.save();
      return res.json({ message: "Anonymous visit tracked", anonId });
    }

    res.status(400).json({ message: "No userId or anonId provided" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- ADMIN: GET ALL USERS --------------------
export const getAllUsers = async (req, res) => {
  try {
   

    const users = await User.find().select("-password"); // hide passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- ADMIN: UPDATE USER ROLE --------------------
export const updateUserRole = async (req, res) => {
  try {
    

    const { role } = req.body;
    if (!["user", "staff", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- ADMIN: DELETE USER --------------------
export const deleteUser = async (req, res) => {
  try {
    

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//-------------------- Get Wishlist --------------------
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "wishlist",
      select: "_id name district images",
      populate: {
        path: "district",
        select: "name",
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

   