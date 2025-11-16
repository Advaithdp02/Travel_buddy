import mongoose from "mongoose";
import dotenv from "dotenv";
import XLSX from "xlsx";
import Location from "./models/Location.js";

dotenv.config();

// Convert any string to proper Title Case
function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const MONGO_URI = process.env.MONGO_URI;

// 1️⃣ Connect to DB
async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");
}

// 2️⃣ Convert XLSX to JSON
function convertXLSXtoJSON(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return jsonData.map((item) => ({
    name: toTitleCase(item["Place Name"]),      // normalize XLSX names
    latitude: Number(item["Latitude"]),
    longitude: Number(item["Longitude"]),
    terrain: item["Terrain"] || "",
  }));
}

// 3️⃣ Update each location (case-insensitive match)
async function updateLocations(data) {
  for (const row of data) {
    const { name, latitude, longitude, terrain } = row;

    if (!name || !latitude || !longitude) {
      console.log(`⚠️ Skipping invalid row:`, row);
      continue;
    }

    // Case-insensitive search
    const updated = await Location.findOneAndUpdate(
  { name: { $regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } },
  {
    $set: {
      name: name, // standardize to clean version
      terrain,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    },
  },
  { new: true }
);

    if (updated) {
      console.log(`✅ Updated: ${updated.name}`);
    } else {
      console.log(`❌ No match found in DB for: ${name}`);
    }
  }
}

async function main() {
  await connectDB();

  const excelFile = "./src/terrain.xlsx";
  const jsonData = convertXLSXtoJSON(excelFile);

  console.log("📘 Total rows in Excel:", jsonData.length);

  await updateLocations(jsonData);

  console.log("🎉 Update complete!");
  mongoose.disconnect();
}

main();
