import mongoose from "mongoose";
import dotenv from "dotenv";
import District from "./models/District.js";

dotenv.config();

// ---------------- DB CONNECT ----------------
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

// ---------------- UTTARAKHAND DISTRICTS ----------------
const districts = [
  {
    name: "Almora",
    DistrictCode: "UK01",
    coordinates: [79.6591, 29.5971],
  },
  {
    name: "Bageshwar",
    DistrictCode: "UK02",
    coordinates: [79.7700, 29.8404],
  },
  {
    name: "Chamoli",
    DistrictCode: "UK03",
    coordinates: [79.3200, 30.4000],
  },
  {
    name: "Champawat",
    DistrictCode: "UK04",
    coordinates: [80.1000, 29.3350],
  },
  {
    name: "Dehradun",
    DistrictCode: "UK05",
    coordinates: [78.0322, 30.3165],
  },
  {
    name: "Haridwar",
    DistrictCode: "UK06",
    coordinates: [78.1642, 29.9457],
  },
  {
    name: "Nainital",
    DistrictCode: "UK07",
    coordinates: [79.4590, 29.3919],
  },
  {
    name: "Pauri Garhwal",
    DistrictCode: "UK08",
    coordinates: [78.7776, 30.1500],
  },
  {
    name: "Pithoragarh",
    DistrictCode: "UK09",
    coordinates: [80.2182, 29.5835],
  },
  {
    name: "Rudraprayag",
    DistrictCode: "UK10",
    coordinates: [79.0669, 30.2844],
  },
  {
    name: "Tehri Garhwal",
    DistrictCode: "UK11",
    coordinates: [78.4800, 30.3800],
  },
  {
    name: "Udham Singh Nagar",
    DistrictCode: "UK12",
    coordinates: [79.4020, 28.9700],
  },
  {
    name: "Uttarkashi",
    DistrictCode: "UK13",
    coordinates: [78.4500, 30.7300],
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
    State: "Uttarakhand",
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
console.log("\n🎉 DISTRICT SEED COMPLETE");
console.log(`✅ Inserted: ${inserted}`);
console.log(`⛔ Skipped (already exists): ${skipped}`);

process.exit();
