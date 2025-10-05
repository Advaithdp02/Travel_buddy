const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed

  role: { type: String, enum: ["user", "admin", "staff"], default: "user" },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  timeSpent: [
    {
      locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
      duration: Number, // in seconds
      lastVisited: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
