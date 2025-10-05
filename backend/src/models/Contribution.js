import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    verified: { type: Boolean, default: false }, // <-- admin verification
  },
  { timestamps: true }
);

const Contribution = mongoose.model("Contribution", contributionSchema);
export default Contribution;
