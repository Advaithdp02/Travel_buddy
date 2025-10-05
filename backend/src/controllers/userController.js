import User from "../models/User.js";
import Location from "../models/Location.js";

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
    const { username, password } = req.body;

    const user = await User.findOne({ username });
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
    const { id: targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId)
      return res.status(400).json({ message: "Cannot follow yourself" });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    if (currentUser.following.includes(targetUserId)) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
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
      .populate("wishlist", "name location"); // if you have Location model

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

    // Only update fields provided in the request body
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
      "profilePic",
      "coverPhoto",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: user.toObject({ getters: true, virtuals: false, versionKey: false }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getOtherUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password") // never expose password
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic")
      .populate("wishlist", "name location");

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

