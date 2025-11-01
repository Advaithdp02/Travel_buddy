import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Hotel from "./models/Hotel.js"; // adjust path

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CITY = "Kannur";
const districtID="68fdac77d7e7f3e6ceb4b222";

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
}

async function fetchHotels(nextPageToken = null) {
  try {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+${CITY}&key=${GOOGLE_API_KEY}`;
    if (nextPageToken) url += `&pagetoken=${nextPageToken}`;

    const response = await axios.get(url);
    const data = response.data;

    for (const place of data.results) {
      const hotel = new Hotel({
        name: place.name,
        review: place.rating || 0,
        location: place.formatted_address,
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
        // You can set district/locationId if you have those already in your DB
      });

      await hotel.save();
    }

    // Handle pagination (Google allows up to 3 pages)
    if (data.next_page_token) {
      console.log("Fetching next page...");
      // Google requires a short delay before using next_page_token
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchHotels(data.next_page_token);
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  await connectDB();
  await fetchHotels();
  console.log("Done fetching hotels!");
  mongoose.disconnect();
}

main();
