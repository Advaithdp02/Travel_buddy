import mongoose from "mongoose";
import dotenv from "dotenv";
import District from "./models/District.js";

dotenv.config();

// ---------------- DB CONNECT ----------------
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

// ---------------- CHANDIGARH DISTRICT ----------------
const districts = [
  {
    name: "Chandigarh",
    DistrictCode: "CH01",
    coordinates: [76.7794, 30.7333],
  },
];

// ---------------- INSERT ----------------
let inserted = 0;
let skipped = 0;

for (const d of districts) {
  const exists = await District.findOne({ DistrictCode: d.DistrictCode });

  if (exists) {
    skipped++;
    continue;
  }

  await District.create({
    name: d.name,
    State: "Chandigarh",
    DistrictCode: d.DistrictCode,
    imageURL: "",
    description: "",
    subtitle: "",
    points: [],
    locations: [],
    coordinates: {
      type: "Point",
      coordinates: d.coordinates,
    },
  });

  inserted++;
  console.log(`✅ Inserted: ${d.name} (${d.DistrictCode})`);
}

// ---------------- DONE ----------------
console.log("\n🎉 CHANDIGARH DISTRICT SEED COMPLETE");
console.log(`✅ Inserted: ${inserted}`);
console.log(`⛔ Skipped: ${skipped}`);

process.exit();
