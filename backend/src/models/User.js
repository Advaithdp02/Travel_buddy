import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    dob: { type: Date }, // Date of Birth
    phone: { type: String },
    location: { type: String }, // e.g., "New York, USA"
    occupation: { type: String },
    relationshipStatus: { type: String, enum: ["Single", "Married", "Other"], default: "Single" },

    profilePic: { type: String }, // URL or filename
    coverPhoto: { type: String }, // URL or filename
    bio: { type: String, maxlength: 500 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }], // wishlist of locations

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    locationsVisited: [
      {
        locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
        timeSpent: { type: Number, default: 0 }, // in seconds
      },
    ],

    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", userSchema);
