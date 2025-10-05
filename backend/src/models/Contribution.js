import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  content: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Contribution = mongoose.model("Contribution", contributionSchema);
export default Contribution;