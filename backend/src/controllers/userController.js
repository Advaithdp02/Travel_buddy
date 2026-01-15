import User from "../models/User.js";
import Location from "../models/Location.js";
import Contribution from "../models/Contribution.js";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AnonymousVisit from "../models/AnonymousVisit.js";
import nodemailer from "nodemailer";
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
    if (!targetUser)
      return res.status(404).json({ message: "Target user not found" });

    if (targetUser._id.toString() === currentUserId)
      return res.status(400).json({ message: "Cannot follow yourself" });

    const currentUser = await User.findById(currentUserId);

    let isFollowing;

    if (currentUser.following.includes(targetUser._id)) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUserId);
      isFollowing = false;
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUserId);
      isFollowing = true;
    }

    // ✅ SAVE FIRST
    await currentUser.save();
    await targetUser.save();

    // ✅ POPULATE CURRENT USER (NOT TARGET USER)
    await currentUser.populate("following", "username profilePic bio");
    await currentUser.populate("followers", "username profilePic bio");

    res.json({
      message: "Follow status updated",
      isFollowing,
      following: currentUser.following,
      followers: currentUser.followers,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- GET USER PROFILE --------------------
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
  .select("-password") // exclude password
  .populate("followers", "username profilePic bio")
  .populate("following", "username profilePic bio")
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
      .populate("followers", "username profilePic bio")
      .populate("following", "username profilePic bio")
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
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    // 👇 Search by name or email
    if (search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // newest first

    res.json({
      users,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete profile pic from S3
    if (user.profilePic) await deleteFromS3(user.profilePic);

    // Delete cover photo from S3
    if (user.coverPhoto) await deleteFromS3(user.coverPhoto);

    // Delete user contributions' images
    const contributions = await Contribution.find({ user: user._id });

    for (const c of contributions) {
      for (const img of c.images) {
        await deleteFromS3(img);
      }
    }

    await Contribution.deleteMany({ user: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({ message: "User and images deleted" });
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

//---------Forget password----------
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your Gmail
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  await transporter.sendMail({
    from: `"Travel App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

// 1️⃣ Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "No account found with that email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}\nThis code expires in 10 minutes.`
    );

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Verify OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 🔍 Step 1: Check required fields
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    // 🔍 Step 2: Find user with matching OTP that hasn't expired
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }, // check expiry
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;

    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); // <--- important!

    console.log("✅ Password reset for:", email);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyToken = async (req, res) => {
  // If this runs, protect() already validated the token
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      role: req.user.role,
    },
  });
};
// GET /users/admin/staff
export const getStaff= async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      role: "staff",
      $or: [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { username: new RegExp(search, "i") },
      ],
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//PUT /admin/staff/:id

export const updateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    const editableFields = [
      "name",
      "username",
      "email",
      "phone",
      "gender",
      "dob",
      "location",
      "occupation",
      "relationshipStatus",
      "bio",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        staff[field] = req.body[field];
      }
    });

    // 🔐 ADMIN PASSWORD CHANGE
    if (req.body.password && req.body.password.trim()) {
      console.log("ADMIN SET PASSWORD");

      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(req.body.password, salt);

      // Optional: invalidate OTP
      staff.resetPasswordOTP = null;
      staff.resetPasswordExpires = null;
    }

    await staff.save();

    res.json({
      success: true,
      message: "Staff updated successfully",
      user: staff,
    });
  } catch (err) {
    console.error("Update staff error:", err);
    res.status(500).json({ message: err.message });
  }
};


