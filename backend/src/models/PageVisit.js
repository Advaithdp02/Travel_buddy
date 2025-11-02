import mongoose from "mongoose";

const pageVisitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null // null for anonymous visitors
    },
    sessionId: {
      type: String,
      required: true // unique per browser session, e.g., UUID or from localStorage
    },
    location: {
      type: String,
      required: true 
    },
    district:{
        type: String,
        required: true
    },
    timeSpent: {
      type: Number,
      required: true, // in seconds
      min: 0
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
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", default: null },
    isAnonymous: {
      type: Boolean,
      default: true
    },
    exitReason: { type: String, default: "unknown" },
isSiteExit: { type: Boolean, default: false }

  },
  { timestamps: true }
);

export default mongoose.model("PageVisit", pageVisitSchema);
