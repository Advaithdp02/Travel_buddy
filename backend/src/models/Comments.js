import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked
  replies: [replySchema], // Array of nested replies
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
