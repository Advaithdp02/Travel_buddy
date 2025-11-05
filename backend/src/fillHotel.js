import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js"; // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const districts = [
  { _id: "68fdac77d7e7f3e6ceb4b21e", name: "Palakkad" },
  { _id: "68fdac77d7e7f3e6ceb4b21d", name: "Thrissur" },
  { _id: "68fdac77d7e7f3e6ceb4b219", name: "Alappuzha" },
  { _id: "68fdac77d7e7f3e6ceb4b220", name: "Kozhikode" },
  { _id: "68fdac77d7e7f3e6ceb4b223", name: "Kasaragod" },
  { _id: "68fdac77d7e7f3e6ceb4b221", name: "Wayanad" },
  { _id: "68fdac77d7e7f3e6ceb4b227", name: "Tiruchirappalli" },
  { _id: "68fdac77d7e7f3e6ceb4b228", name: "Bengaluru Urban" },
  { _id: "68fdac77d7e7f3e6ceb4b225", name: "Coimbatore" },
  { _id: "68fdac77d7e7f3e6ceb4b21a", name: "Kottayam" },
  { _id: "68fdac77d7e7f3e6ceb4b21f", name: "Malappuram" },
  { _id: "68fdac77d7e7f3e6ceb4b217", name: "Kollam" },
  { _id: "68fdac77d7e7f3e6ceb4b218", name: "Pathanamthitta" },
  { _id: "68fdac77d7e7f3e6ceb4b21b", name: "Idukki" },
  { _id: "68fdac77d7e7f3e6ceb4b216", name: "Thiruvananthapuram" },
];

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function fetchHotels(CITY, districtID, nextPageToken = null) {
  try {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+${CITY}&key=${GOOGLE_API_KEY}`;
    if (nextPageToken) url += `&pagetoken=${nextPageToken}`;

    const response = await axios.get(url);
    const data = response.data;

    if (!data.results || data.results.length === 0) {
      return;
    }

    for (const place of data.results) {
      // Only check duplicates based on name + location + district
      const existing = await Hotel.findOne({
        name: place.name,
        location: place.formatted_address,
        district: districtID,
      });

      if (existing) continue; // skip duplicates

      const hotel = new Hotel({
        name: place.name,
        review: place.rating || 0,
        location: place.formatted_address || "",
        district: districtID,
        description: place.types ? `A hotel categorized as: ${place.types.join(", ")}` : "",
        amenities: place.types || [],
        coordinates: {
          type: "Point",
          coordinates: [place.geometry.location.lng, place.geometry.location.lat],
          link: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        },
        img: place.photos
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : "",
      });

      await hotel.save();
    }

    // Pagination: up to 3 pages
    if (data.next_page_token) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
      await fetchHotels(CITY, districtID, data.next_page_token);
    }
  } catch (error) {
    console.error(`❌ Error fetching hotels for ${CITY}:`, error.message);
  }
}

async function main() {
  await connectDB();

  for (const district of districts) {
    await fetchHotels(district.name, district._id);
  }

  console.log("🎉 Done fetching hotels for all districts!");
  mongoose.disconnect();
}

main();
