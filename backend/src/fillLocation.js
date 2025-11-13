import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// ---------------- PATH SETUP ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, "./locaData.xlsx");
const outputPath = path.join(__dirname, "./enriched_locations.json");

if (!fs.existsSync(excelPath)) {
  console.error("❌ Excel file not found at:", excelPath);
  process.exit(1);
}

// ---------------- READ EXCEL ----------------
console.log("📘 Reading Excel file:", excelPath);
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);
console.log(`📄 Found ${rows.length} rows in Excel.`);

// ---------------- HELPERS ----------------

// Fetch coordinates + district from OpenStreetMap
async function getLocationDetails(place) {
  if (!place) return { coordinates: [0, 0], district: "Unknown District" };

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
      place + ", Kerala, India"
    )}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Location-Fetcher/1.0 (youremail@example.com)" },
    });

    const data = await res.json();
    if (data.length > 0) {
      const { lat, lon, address } = data[0];
      const district =
        address.state_district ||
        address.county ||
        address.city_district ||
        address.city ||
        address.state ||
        "Unknown District";
      return { coordinates: [parseFloat(lon), parseFloat(lat)], district };
    } else {
      console.warn(`⚠️ No coordinates found for: ${place}`);
      return { coordinates: [0, 0], district: "Unknown District" };
    }
  } catch (err) {
    console.error(`❌ Error fetching location for ${place}:`, err.message);
    return { coordinates: [0, 0], district: "Unknown District" };
  }
}

// Fetch rating/popularity from OpenTripMap
async function getOpenTripMapRating(place) {
  try {
    const url = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
      place
    )}&country=IN`;

    const res = await fetch(url);
    const data = await res.json();

    if (data && data.name && data.lat && data.lon) {
      const xidUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${data.lon}&lat=${data.lat}&limit=1&format=json`;
      const res2 = await fetch(xidUrl);
      const places = await res2.json();

      if (Array.isArray(places) && places.length > 0 && places[0].rate) {
        const starRating = (places[0].rate / 2).toFixed(1);
        return Number(starRating);
      }
    }

    return Number((Math.random() * 2 + 3).toFixed(1)); // fallback 3–5
  } catch (err) {
    console.warn(`⚠️ Could not fetch rating for ${place}:`, err.message);
    return Number((Math.random() * 2 + 3).toFixed(1));
  }
}

// ---------------- PROCESS ENTIRE SHEET ----------------
const enrichedData = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const place = row["PLACE NAME"];
  if (!place) continue;

  console.log(`\n🔍 [${i + 1}/${rows.length}] Processing: ${place}`);

  const { coordinates, district } = await getLocationDetails(place);
  const avgReview = await getOpenTripMapRating(place);
  const reviewCount = Math.floor(Math.random() * 200 + 10);

  const location = {
    name: place || "Unknown",
    district,
    description: row["DESCRIPTION"] || "",
    subtitle: row["BEST TIME TO VISIT THE PLACE"] || "",
    terrain: row["TERRAIN"] || "",
    points: [
      `Facilities: ${row["FACILITIES"] || "N/A"}`,
      `Cost: ${row["COST"] || "N/A"}`,
      `Safety: ${row["SAFETY"] || "N/A"}`,
      `Guides: ${
        row["GUIDES( CERTIFIED GUIDES AVAILABLE AT COUNTERS)"] || "N/A"
      }`,
      `Tips: ${row["TIPS( ADD A FUN OR USEFUL TIP FOR VISITORS)"] || ""}`,
      `Hours: ${row["HOURS(INSERT OPENING HOURS)"] || ""}`,
    ],
    reviewLength: reviewCount,
    review: avgReview,
    coordinates: {
      type: "Point",
      coordinates,
    },
    roadSideAssistant: "",
    policeStation: "",
    ambulance: "",
    localSupport: "",
    contributions: [],
    comments: [],
    createdAt: new Date(),
  };

  enrichedData.push(location);
  console.log(`✅ Processed: ${location.name} (${district}) ⭐ ${avgReview}`);

  // Delay between each request (1/sec to respect OpenStreetMap TOS)
  await new Promise((r) => setTimeout(r, 1000));
}

// ---------------- EXPORT TO JSON ----------------
fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2));
console.log(`\n📦 Exported ${enrichedData.length} locations to: ${outputPath}`);
console.log("✨ All done! Full dataset enriched and ready for MongoDB import.");
