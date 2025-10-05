import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
    description: { type: String },
    images: [String],
    coordinates: {
      lat: Number,
      lng: Number
    },
    createdAt: { type: Date, default: Date.now },

  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contribution" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;

  
