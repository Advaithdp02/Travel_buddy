import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // NEW → The location info user is submitting
    title: { type: String, required: true },               // Location Name
    subtitle: { type: String },                            // Short description
    district: { type: String, required: true },            // Text, admin will map
    description: { type: String, required: true },

    // GeoJSON coordinates
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    // Points / highlights
    points: [{ type: String }],

    // Images
    images: [String],
    coverImage: String,

    // Visit details
    bestTimeToVisit: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Sunrise", "Sunset", "Anytime"]
    },
    crowded: { type: Boolean, default: false },
    familyFriendly: { type: Boolean, default: true },
    petFriendly: { type: Boolean, default: false },
    accessibility: {
      type: String,
      enum: ["Easy", "Moderate", "Difficult", "Unknown"],
      default: "Unknown"
    },

    // Activities & Facilities
    activities: [{ type: String }],
    facilities: [{ type: String }],

    // Ratings
    ratings: {
      overall: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 },
      crowd: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 }
    },

    tips: String,
    hiddenGems: [String],

    // Social
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // Admin Approval
    verified: { type: Boolean, default: false },

    // If approved → link to created Location
    approvedLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null
    }
  },
  { timestamps: true }
);

// Geo index
contributionSchema.index({ coordinates: "2dsphere" });

const Contribution = mongoose.model("Contribution", contributionSchema);
export default Contribution;
