import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    district: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
    description: { type: String },
    subtitle: { type: String },
    points: [{ type: String }],
    images: [{ type: String }],
    terrain: { type: String },
    reviewLength:{type:Number},
    review:{type:Number},

    // GeoJSON coordinates
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },

    contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contribution" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Add 2dsphere index for geospatial queries
locationSchema.index({ coordinates: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

export default Location;
