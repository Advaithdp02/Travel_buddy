import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  review: { type: Number, min: 0, max: 5, default: 0 },
  description: { type: String },
  amenities: [String],
  location: { type: String, required: true }, // human-readable address
  district: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" }, // optional reference
  img: { type: String },
  coordinates: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    link: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

hotelSchema.index({ coordinates: "2dsphere" });

export default mongoose.model("Hotel", hotelSchema);

