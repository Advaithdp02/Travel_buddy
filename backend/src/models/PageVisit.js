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

    // ⭐ EXACT FROM & TO URL
    fromUrl: { type: String, required: true },
    toUrl: { type: String, default: null },

    // ⭐ ACTION TYPE (what happened)
    actionType: {
      type: String,
      enum: [
        "page_load",
        "internal_navigation",
        "external_exit",
        "tab_hidden_exit",
        "tab_close_exit",
        "reload_exit",
        "idle_timeout_exit"
      ],
      required: true
    },

    // ⭐ For readable understanding
    exitReason: { type: String, default: null },

    // ⭐ Did user leave the site fully?
    isSiteExit: { type: Boolean, default: false },

    // ⭐ Time spent on FROM page
    timeSpent: {
      type: Number,
      min: 0,
      required: true
    },

    // ---------------------------------------
    // ADD YOUR OTHER FIELDS (location, device)
    // ---------------------------------------
    location: { type: String, required: true },
    district: { type: String, required: true },
    fromLocation: { type: String, default: null },
    toLocation: { type: String, default: null },
    fromDistrict: { type: String, default: null },
    toDistrict: { type: String, default: null },

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

    visitedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// GEO location indexing
pageVisitSchema.index({ geoLocation: "2dsphere" });

export default mongoose.model("PageVisit", pageVisitSchema);
