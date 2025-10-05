const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
  content: { type: String, required: true },
  verified: { type: Boolean, default: false }, // admin must verify
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contribution", contributionSchema);
