import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String, // human-readable address
    required: true,
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location", // reference the location it's near (optional)
  },
  img: {
    type: String, // main image URL
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial queries
hotelSchema.index({ coordinates: "2dsphere" });

export default mongoose.model("Hotel", hotelSchema);
