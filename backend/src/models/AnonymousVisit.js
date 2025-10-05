import mongoose from "mongoose";

const anonymousVisitSchema = new mongoose.Schema(
  {
    anonId: {
      type: String,
      required: true,
      index: true, 
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    lastVisited: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AnonymousVisit = mongoose.model("AnonymousVisit", anonymousVisitSchema);

export default AnonymousVisit;
