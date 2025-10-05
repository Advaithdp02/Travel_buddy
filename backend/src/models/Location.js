const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  district: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
  coordinates: {
    lat: Number,
    lng: Number
  },
  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contribution" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Location", locationSchema);
