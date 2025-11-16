import mongoose from "mongoose";

const pageVisitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    sessionId: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    district: {
      type: String,
      required: true
    },

    // ⭐ GEOJSON POINT (lat/lng)
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [long, lat]
        required: false
      }
    },

    timeSpent: {
      type: Number,
      min: 0,
      required: true
    },

    visitedAt: {
      type: Date,
      default: Date.now
    },

    deviceInfo: {
      browser: String,
      os: String,
      deviceType: String
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null
    },

    isAnonymous: {
      type: Boolean,
      default: true
    },

    exitReason: { type: String, default: "unknown" },
    isSiteExit: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Required for location-based queries
pageVisitSchema.index({ geoLocation: "2dsphere" });

export default mongoose.model("PageVisit", pageVisitSchema);
