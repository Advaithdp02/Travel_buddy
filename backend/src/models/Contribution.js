import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },

    // Basic info
    description: { type: String, required: true },
    images: [String], // multiple images
    coverImage: String, // optional cover image

    // Visit details
    bestTimeToVisit: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Sunrise", "Sunset", "Anytime"],
    },
    crowded: { type: Boolean, default: false },
    familyFriendly: { type: Boolean, default: true },
    petFriendly: { type: Boolean, default: false },
    accessibility: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult", "Unknown"],
      default: "Unknown",
    },

    // Activities & facilities
    activities: [{ type: String }], // e.g., ["Sightseeing", "Photography"]
    facilities: [{ type: String }], // e.g., ["Parking", "Toilets", "Cafes"]

    // Ratings (1–5)
    ratings: {
      overall: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 },
      crowd: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
    },

    // Tips / notes
    tips: String,
    hiddenGems: [String], // optional array of tips or nearby attractions

    // Social interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    
    // Admin verification
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Contribution = mongoose.model("Contribution", contributionSchema);
export default Contribution;
