const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
});

module.exports = mongoose.model("District", districtSchema);
