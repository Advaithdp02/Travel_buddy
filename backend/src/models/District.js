import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageURL: { type: String },
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
});

const District = mongoose.model("District", districtSchema);
export default District;