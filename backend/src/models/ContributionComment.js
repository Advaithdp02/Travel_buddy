import mongoose from "mongoose";

const contributionCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contribution: { type: mongoose.Schema.Types.ObjectId, ref: "Contribution", required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const ContributionComment = mongoose.model("ContributionComment", contributionCommentSchema);
export default ContributionComment;
