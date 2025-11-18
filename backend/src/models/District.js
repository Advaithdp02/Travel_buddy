import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageURL: { type: String },
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
  State: { type:String, required: true },
  DistrictCode:{type:String ,required:true, unique: true},
  description: { type: String },
  subtitle: { type: String },
  points: [{ type: String }],
  coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },

});
districtSchema.index({ coordinates: "2dsphere" });

const District = mongoose.model("District", districtSchema);
export default District;