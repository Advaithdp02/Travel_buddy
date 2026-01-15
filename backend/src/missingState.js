import mongoose from "mongoose";
import dotenv from "dotenv";
import District from "./models/District.js";

dotenv.config();

// ---------------- DB CONNECT ----------------
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

// ---------------- UTTAR PRADESH DISTRICTS ----------------
const districts = [
  { name: "Agra", DistrictCode: "UP01", coordinates: [78.0081, 27.1767] },
  { name: "Aligarh", DistrictCode: "UP02", coordinates: [78.0880, 27.8974] },
  { name: "Ambedkar Nagar", DistrictCode: "UP03", coordinates: [82.6697, 26.4054] },
  { name: "Amethi", DistrictCode: "UP04", coordinates: [81.8190, 26.1548] },
  { name: "Amroha", DistrictCode: "UP05", coordinates: [78.4675, 28.9031] },
  { name: "Auraiya", DistrictCode: "UP06", coordinates: [79.5092, 26.4652] },
  { name: "Ayodhya", DistrictCode: "UP07", coordinates: [82.1409, 26.7922] },
  { name: "Azamgarh", DistrictCode: "UP08", coordinates: [83.1836, 26.0737] },
  { name: "Baghpat", DistrictCode: "UP09", coordinates: [77.2194, 28.9440] },
  { name: "Bahraich", DistrictCode: "UP10", coordinates: [81.5980, 27.5740] },
  { name: "Ballia", DistrictCode: "UP11", coordinates: [84.1470, 25.7584] },
  { name: "Balrampur", DistrictCode: "UP12", coordinates: [82.1920, 27.4316] },
  { name: "Banda", DistrictCode: "UP13", coordinates: [80.3360, 25.4776] },
  { name: "Barabanki", DistrictCode: "UP14", coordinates: [81.1997, 26.9386] },
  { name: "Bareilly", DistrictCode: "UP15", coordinates: [79.4304, 28.3670] },
  { name: "Basti", DistrictCode: "UP16", coordinates: [82.7160, 26.8155] },
  { name: "Bhadohi", DistrictCode: "UP17", coordinates: [82.5675, 25.3950] },
  { name: "Bijnor", DistrictCode: "UP18", coordinates: [78.1348, 29.3732] },
  { name: "Budaun", DistrictCode: "UP19", coordinates: [79.1200, 28.0381] },
  { name: "Bulandshahr", DistrictCode: "UP20", coordinates: [77.8498, 28.4069] },
  { name: "Chandauli", DistrictCode: "UP21", coordinates: [83.2686, 25.2613] },
  { name: "Chitrakoot", DistrictCode: "UP22", coordinates: [80.8650, 25.2100] },
  { name: "Deoria", DistrictCode: "UP23", coordinates: [83.7860, 26.5020] },
  { name: "Etah", DistrictCode: "UP24", coordinates: [78.6692, 27.5588] },
  { name: "Etawah", DistrictCode: "UP25", coordinates: [79.0210, 26.7760] },
  { name: "Farrukhabad", DistrictCode: "UP26", coordinates: [79.5800, 27.3900] },
  { name: "Fatehpur", DistrictCode: "UP27", coordinates: [80.8140, 25.9300] },
  { name: "Firozabad", DistrictCode: "UP28", coordinates: [78.3950, 27.1500] },
  { name: "Gautam Buddha Nagar", DistrictCode: "UP29", coordinates: [77.4900, 28.5355] },
  { name: "Ghaziabad", DistrictCode: "UP30", coordinates: [77.4538, 28.6692] },
  { name: "Ghazipur", DistrictCode: "UP31", coordinates: [83.5850, 25.5830] },
  { name: "Gonda", DistrictCode: "UP32", coordinates: [81.9535, 27.1339] },
  { name: "Gorakhpur", DistrictCode: "UP33", coordinates: [83.3732, 26.7606] },
  { name: "Hamirpur", DistrictCode: "UP34", coordinates: [80.1500, 25.9500] },
  { name: "Hapur", DistrictCode: "UP35", coordinates: [77.7807, 28.7298] },
  { name: "Hardoi", DistrictCode: "UP36", coordinates: [80.1200, 27.3900] },
  { name: "Hathras", DistrictCode: "UP37", coordinates: [78.0530, 27.5950] },
  { name: "Jalaun", DistrictCode: "UP38", coordinates: [79.3400, 26.1450] },
  { name: "Jaunpur", DistrictCode: "UP39", coordinates: [82.6837, 25.7464] },
  { name: "Jhansi", DistrictCode: "UP40", coordinates: [78.5685, 25.4484] },
  { name: "Kannauj", DistrictCode: "UP41", coordinates: [79.9200, 27.0550] },
  { name: "Kanpur Dehat", DistrictCode: "UP42", coordinates: [79.8000, 26.4150] },
  { name: "Kanpur Nagar", DistrictCode: "UP43", coordinates: [80.3319, 26.4499] },
  { name: "Kasganj", DistrictCode: "UP44", coordinates: [78.6450, 27.8100] },
  { name: "Kaushambi", DistrictCode: "UP45", coordinates: [81.3800, 25.5300] },
  { name: "Kheri", DistrictCode: "UP46", coordinates: [80.7850, 27.8970] },
  { name: "Kushinagar", DistrictCode: "UP47", coordinates: [83.8900, 26.7400] },
  { name: "Lalitpur", DistrictCode: "UP48", coordinates: [78.4200, 24.6900] },
  { name: "Lucknow", DistrictCode: "UP49", coordinates: [80.9462, 26.8467] },
  { name: "Maharajganj", DistrictCode: "UP50", coordinates: [83.5600, 27.1500] },
  { name: "Mahoba", DistrictCode: "UP51", coordinates: [79.8800, 25.3000] },
  { name: "Mainpuri", DistrictCode: "UP52", coordinates: [79.0200, 27.2300] },
  { name: "Mathura", DistrictCode: "UP53", coordinates: [77.6737, 27.4924] },
  { name: "Mau", DistrictCode: "UP54", coordinates: [83.5610, 25.9417] },
  { name: "Meerut", DistrictCode: "UP55", coordinates: [77.7064, 28.9845] },
  { name: "Mirzapur", DistrictCode: "UP56", coordinates: [82.5700, 25.1500] },
  { name: "Moradabad", DistrictCode: "UP57", coordinates: [78.7730, 28.8386] },
  { name: "Muzaffarnagar", DistrictCode: "UP58", coordinates: [77.7085, 29.4727] },
  { name: "Pilibhit", DistrictCode: "UP59", coordinates: [79.8000, 28.6300] },
  { name: "Pratapgarh", DistrictCode: "UP60", coordinates: [81.9900, 25.9000] },
  { name: "Prayagraj", DistrictCode: "UP61", coordinates: [81.8463, 25.4358] },
  { name: "Raebareli", DistrictCode: "UP62", coordinates: [81.2500, 26.2300] },
  { name: "Rampur", DistrictCode: "UP63", coordinates: [79.0250, 28.8150] },
  { name: "Saharanpur", DistrictCode: "UP64", coordinates: [77.5460, 29.9700] },
  { name: "Sambhal", DistrictCode: "UP65", coordinates: [78.5500, 28.5800] },
  { name: "Sant Kabir Nagar", DistrictCode: "UP66", coordinates: [82.9800, 26.7750] },
  { name: "Shahjahanpur", DistrictCode: "UP67", coordinates: [79.9100, 27.8800] },
  { name: "Shamli", DistrictCode: "UP68", coordinates: [77.3200, 29.4500] },
  { name: "Shravasti", DistrictCode: "UP69", coordinates: [81.9300, 27.5100] },
  { name: "Siddharthnagar", DistrictCode: "UP70", coordinates: [83.0900, 27.2700] },
  { name: "Sitapur", DistrictCode: "UP71", coordinates: [80.6800, 27.5600] },
  { name: "Sonbhadra", DistrictCode: "UP72", coordinates: [83.0700, 24.4000] },
  { name: "Sultanpur", DistrictCode: "UP73", coordinates: [82.0700, 26.2600] },
  { name: "Unnao", DistrictCode: "UP74", coordinates: [80.4900, 26.5400] },
  { name: "Varanasi", DistrictCode: "UP75", coordinates: [82.9739, 25.3176] },
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
    State: "Uttar Pradesh",
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
