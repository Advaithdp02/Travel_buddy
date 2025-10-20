import React, { useEffect, useState } from 'react';

import {
  StarIcon,
  CheckIcon,
  WeatherIcon,
  PhoneIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  LocationPinIcon,
  DistanceArrow,
  TimeClock,
  LocationWithTime,
  Cloud
} from './Icons';
import { useParams } from 'react-router-dom';
import { CommunityModal } from './CommunityModal';
import usePageTimeTracker from '../hooks/usePageTimeTracker';
import MapComponent from './MapComponent';

const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
const Backend_URL = import.meta.env.VITE_BACKEND_URL;

export const DestinationPage = ({ currentPage, navigate }) => {
  usePageTimeTracker();
  const [activeTab, setActiveTab] = useState("comments");
  const locationId = useParams();
  const[isModalOpen,setIsModalOpen] = useState(false);
  
  // Hero Section
  const [hero, setHero] = useState({ title: "", subtitle: "", bgImg: "" });

  // About Section
  const [about, setAbout] = useState({
    heading: "",
    subHeading: "",
    description: "",
    points: [],
    rating: 4.8,
    reviews: 836,
    images: []
  });

  const [lat, setLat] = useState(11.6856);
  const [lon, setLon] = useState(76.1310);

  // Community Section
  const [comments, setComments] = useState([
    { user: "Rahul", text: "Amazing viewpoint! Totally worth the trek." },
    { user: "Meera", text: "The misty mornings here are unforgettable." }
  ]);

  const [contributions, setContributions] = useState([
    { user: "Anita", title: "Best Time to Visit", detail: "Early morning before 9 AM gives the best views." },
    { user: "Suresh", title: "Travel Tip", detail: "Carry water bottles and wear proper shoes for the trek." }
  ]);

  // Places, Hotels, Nearby Places
  const [places, setPlaces] = useState([
    
  ]);

  const [hotels, setHotels] = useState([
    { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel1/150/100" },
    { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel2/150/100" },
    { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel3/150/100" },
     { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel3/150/100" },
      { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel3/150/100" }
      
  ]);

  const [nearbyPlaces, setNearbyPlaces] = useState([
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby1/150/100" },
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby2/150/100" },
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby3/150/100" },
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby4/150/100" }
  ]);

  // Weather
  const [weather, setWeather] = useState({
    temp: "",
    lastUpdated: "",
    wind: "",
    probability: "",
    pressure: "",
    dewPoint: "",
    humidity: "",
    cloudCover: "",
    uvIndex: "",
    visibility: "",
    precipitation: "",
    sunrise: "",
    airQuality: "",
    sunset: ""
  });

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState([
    "Road side Assistant",
    "Police Station",
    "Ambulance",
    "Local Support"
  ]);

  // Map Info
  const [mapInfo, setMapInfo] = useState({
    distance: "244 kM",
    arrival: "12.00 AM",
    time: "6hr 11Min",
    img: "https://i.imgur.com/k2e4b4C.png",
    destinationCoords:[]
    
  });
  const [mapKey,setMapKey]=useState(0);

  // Filters
  const [filters, setFilters] = useState({
    state: "Kerala",
    district: "",
    terrain: "Mountain"
  });

  const [allDistricts, setAllDistricts] = useState([]);

// Utility to calculate distance (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

// Travel time
const calculateTime = (distanceKm, speedKmph = 60) => {
  const timeHours = distanceKm / speedKmph;
  const hours = Math.floor(timeHours);
  const minutes = Math.round((timeHours - hours) * 60);
  return `${hours} hr ${minutes} min`;
};




useEffect(() => {

    const fetchhLocationDistrict = async () => {
      if (!filters.district) return; 
      try {
        const districtRes = await fetch(`${Backend_URL}/locations/district/${filters.district}`);
        const districtData = await districtRes.json();

       const userCoords = JSON.parse(localStorage.getItem("userCoords") || '{"latitude":0,"longitude":0}');

const origin = { lat: userCoords.latitude, lon: userCoords.longitude };
      const enrichedPlaces = (districtData || []).map((place) => {
        const [lon, lat] = place.coordinates.coordinates; // GeoJSON order: [lon, lat]

        const distance = calculateDistance(origin.lat, origin.lon, lat, lon);
        const travelTime = calculateTime(distance);
        const now = new Date();
         const timeHours = distance / 60; // Assuming 80 km/h average speed
        const arrival = new Date(now.getTime() + timeHours * 3600 * 1000);
        const arrivalTime = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return {
          ...place,
          distance: `${distance.toFixed(2)} km`,
          travelTime,
          arrivalTime
        };
      });
      
      console.log(enrichedPlaces);

      setPlaces(enrichedPlaces);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };
    fetchhLocationDistrict();

  }, [filters.district]);
useEffect(() => {
  const fetchLocationData = async () => {
    try {
      const districtRes = await fetch(`${Backend_URL}/districts/`);
      const districtData = await districtRes.json();

      // Store all districts separately
      setAllDistricts(districtData);

      // Fetch location details from backend
      const res = await fetch(`${Backend_URL}/locations/${locationId.id}`);
      const data = await res.json();
      localStorage.setItem("location_id", data._id);

      // Hero & About
      setHero({
        title: data.name,
        subtitle: data.description || "Beautiful Place",
        bgImg: data.images[0] || "https://picsum.photos/seed/default/1600/900",
      });

      setAbout({
        heading: `About ${data.name}`,
        subHeading: `Explore the beauty of ${data.name}`,
        description: data.description || "No description available",
        points: ["Stunning views", "Great for trekking", "Photographer's paradise"],
        rating: 4.5,
        reviews: 120,
        images: data.images.slice(0, 2),
      });

      const commentRes = await fetch(`${Backend_URL}/comments/location/${data._id}`);
      const commentData = await commentRes.json();

      setComments(commentData || []);
      setContributions(data.contributions || []);
      setPlaces(data.places || []);
      
      setNearbyPlaces(data.nearbyPlaces || []);

      // ✅ Get user coordinates (from localStorage)
      const userCoords = JSON.parse(
        localStorage.getItem("userCoords") || '{"latitude":0,"longitude":0}'
      );

      // ✅ Set map info with both user & destination coordinates
      setMapInfo((prev) => ({
        ...prev,
        userCoordinates: [userCoords.longitude, userCoords.latitude],
        destinationCoordinates: data.coordinates.coordinates,
      }));
      setMapKey(prev => prev + 1); 

      // ✅ Extract lat/lon for weather
      const [lon, lat] = data.coordinates.coordinates;
      setLat(lat);
      setLon(lon);

      // 🌦️ Fetch Weather Data
      const currentRes = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`
      );
      const currentData = await currentRes.json();
      const current = currentData.current;

      const today = new Date().toISOString().split("T")[0];
      const astroRes = await fetch(
        `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${lat},${lon}&dt=${today}`
      );
      const astroData = await astroRes.json();
      const astro = astroData.astronomy.astro;

      const forecastRes = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1`
      );
      const forecastData = await forecastRes.json();
      const chanceOfRain = forecastData.forecast.forecastday[0].day.daily_chance_of_rain;

      setWeather({
        temp: `${current.temp_c}°C`,
        lastUpdated: current.last_updated,
        wind: `${current.wind_kph} km/h (${current.wind_dir})`,
        probability: chanceOfRain > 50 ? "High" : "Low",
        pressure: `${current.pressure_mb} mb`,
        dewPoint: `${current.dewpoint_c}°C`,
        humidity: `${current.humidity}%`,
        cloudCover: `${current.cloud}%`,
        uvIndex: current.uv,
        visibility: `${current.vis_km} km`,
        precipitation: `${current.precip_mm} mm`,
        sunrise: astro.sunrise,
        sunset: astro.sunset,
        airQuality: current.air_quality
          ? `CO: ${current.air_quality.co.toFixed(1)}, PM2.5: ${current.air_quality.pm2_5.toFixed(1)}`
          : "N/A",
      });

      console.log("✅ Map Info Updated:", {
        userCoords,
        destinationCoords: data.coordinates.coordinates,
      });
    } catch (err) {
      console.error("Error fetching location or weather data:", err);
    }
  };

  fetchLocationData();
}, [locationId]);


  
 
  
  return (
    <div className='pl-[80px] pr-[80px] pt-[40px]'>
      

      {/* Hero Section */}
      
        <section className="relative h-[60vh] w-full flex items-center ">
          {/* Background Image with gradient overlay */}
          <div
            className="absolute inset-0 rounded-[20px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${hero.bgImg})`,
            }}
          ></div>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-transparent to-[#1D1D51]"></div>

          {/* Text Content */}
          <div className="relative z-10 text-left max-w-[724px] left-[25px] px-4">
            {/* Small Subtitle */}
            <h3
              className="text-[#F2B024] font-schoolbell text-[30px]  leading-[42px]"
              style={{ fontFamily: 'Schoolbell, cursive' }}
            >
              {hero.title}
            </h3>

                {/* Main Heading */}
                <h1
                  className="text-white font-baloo text-[65px] leading-[70px] mt-2"
                  style={{ fontFamily: 'Baloo, cursive' }}
                >
                  {hero.subtitle}
                </h1>
              </div>
            </section>


      {/* About Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96">
            <img
              src={about.images[0]}
              alt="Viewpoint"
              className="absolute top-0 left-0 w-2/3 h-full object-cover rounded-xl shadow-lg"
            />
            <img
              src={about.images[1]}
              alt="Viewpoint detail"
              className="absolute bottom-0 right-0 w-1/2 border-8 border-white rounded-xl shadow-2xl"
            />
            <div className="absolute top-4 right-8 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center space-x-2">
              <StarIcon className="text-yellow-400" />
              <span className="font-bold text-brand-dark">{about.rating}</span>
              <span className="text-xs text-brand-gray">Based on {about.reviews} Reviews</span>
            </div>
          </div>

          <div>
                {/* Main Heading */}
                <h2
                  className="text-[#3F3F3F] font-schoolbell text-[30px] leading-[42px]"
                  
                >
                  {about.heading}
                </h2>
                {/* Small Subtitle */}
                <p
                  className="text-[#F2B024]   font-baloo  text-[40px] leading-[50px] my-3"
                  
                >
                  {about.subtitle||"A Window to Wayanad's Scenic Splendor"}
                </p>

                

                {/* Description */}
                <p
                  className="text-[#726E6E] font-roboto text-[12px] leading-[23px] mb-6"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {about.description}
                </p>

                {/* Points List */}
                <ul className="space-y-3 text-brand-gray mb-8">
                  {about.points.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className="text-brand-yellow mr-2 mt-1 flex-shrink-0" /> {point}
                    </li>
                  ))}
                </ul>

                {/* Wishlist Button */}
                <button className="bg-brand-yellow text-brand-dark font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">
                  {about.buttonText || "WishList"}
                </button>
              </div>

        </div>
      </section>

      {/* Comments & Contributions */}
      <section className="py-16 px-8 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark mb-6">Community Insights</h2>

            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("comments")}
                className={`pb-2 font-semibold transition-colors ${
                  activeTab === "comments"
                    ? "border-b-2 border-brand-yellow text-brand-dark"
                    : "text-brand-gray"
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("contributions")}
                className={`pb-2 font-semibold transition-colors ${
                  activeTab === "contributions"
                    ? "border-b-2 border-brand-yellow text-brand-dark"
                    : "text-brand-gray"
                }`}
              >
                Contributions
              </button>
            </div>

            {/* Tab Content */}
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform:
                    activeTab === "comments" ? "translateX(0%)" : "translateX(-50%)",
                  width: "200%",
                }}
              >
                {/* -------------------- COMMENTS TAB -------------------- */}
                <div className="w-full pr-6">
                  <div className="space-y-4">
                    {comments.length === 0 && (
                      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center">
                        <span className="text-gray-500">No comments yet</span>
                        <button
                          className="bg-brand-yellow text-brand-dark font-semibold py-1 px-3 rounded"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Add Comment
                        </button>
                      </div>
                    )}

                    {comments.length > 0 &&
                      comments.slice(0, 3).map((c, index) => (
                        <div
                          key={c._id || index}
                          className="bg-white p-4 rounded-xl shadow border border-gray-100 cursor-pointer flex gap-3"
                          onClick={() => setIsModalOpen(true)}
                        >
                          {/* Profile Picture */}
                          {c.user?.profilePic && (
                            <img
                              src={c.user.profilePic}
                              alt={c.user.name || c.user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}

                          <div className="flex-1">
                            <p className="text-sm text-brand-dark font-semibold">
                              {c.user?.name || c.user?.username || "Unknown User"}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">{c.text}</p>
                          </div>
                        </div>
                      ))}

                    {comments.length > 0 && comments.length <= 3 && (
                      <button
                        className="bg-brand-yellow text-brand-dark font-semibold py-2 px-4 rounded mt-2"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Add Comment
                      </button>
                    )}
                  </div>
                </div>

                {/* -------------------- CONTRIBUTIONS TAB -------------------- */}
                <div className="w-full pl-6">
                  <div className="space-y-4">
                    {contributions.length === 0 ? (
                      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-gray-500">
                        No contributions yet
                      </div>
                    ) : (
                      contributions.slice(0, 3).map((c, index) => (
                        <div
                          key={c._id || index}
                          className="bg-white p-4 rounded-xl shadow border border-gray-100 cursor-pointer"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <h4 className="font-semibold text-brand-dark">{c.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{c.detail}</p>
                          <span className="text-xs text-brand-gray">
                            Shared by{" "}
                            {c.user?.name || c.user?.username || "Unknown User"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


          <CommunityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            activeTab={activeTab}
            comments={comments}
            contributions={contributions}
          />


      {/* Filter & Places Section */}
      <section className="bg-brand-light-purple py-12 px-8">
        <div className="container mx-auto">
          <div className="bg-brand-dark rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 mb-10">
            <span className="text-white text-2xl font-bold">Filter</span>
            <div className="flex-grow flex flex-wrap items-center gap-4">
              <select
                className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              >
                <option>Kerala</option>
              </select>
              <select
                className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              >
                {allDistricts.map((district) => (
                  <option key={district._id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
              <select
                className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto"
                value={filters.terrain}
                onChange={(e) => setFilters({ ...filters, terrain: e.target.value })}
              >
                <option>Mountain</option>
                <option>Hill</option>
              </select>
            </div>
            <button className="bg-brand-yellow text-brand-dark font-bold py-3 px-8 rounded-lg w-full sm:w-auto">
              SEARCH
            </button>
          </div>

          <div className="relative w-full">
  {/* Horizontal Scroll Container */}
  <div className="flex overflow-x-auto space-x-6 pb-4 px-4 scroll-smooth snap-x snap-mandatory">
    {places.map((place, index) => (
      <div
        key={index}
        className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg p-4 snap-start"
      >
        <img
          src={place.images[0]}
          alt={place.name}
          className="w-full h-40 object-cover rounded-xl mb-4"
        />

        <h3 className="text-lg font-bold text-brand-dark">{place.name}</h3>
        <p className="text-xs text-brand-gray mb-3 truncate">
          {place.location }
        </p>

        <div className="text-xs text-brand-gray flex justify-between border-t pt-2">
          {/* Distance */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#726E6E] flex items-center justify-center">
              <DistanceArrow className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none text-center gap-2">
              <span className="text-[12px] text-[#9C9C9C] font-['Roboto']">Distance</span>
              <span className="text-[13px] text-[#37377B] font-['Baloo'] font-bold">
                {place.distance}
              </span>
            </div>
          </div>

          {/* Arrival */}
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[60px] text-[#726E6E] flex items-center justify-center">
              <LocationWithTime className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none text-center gap-2">
              <span className="text-[12px] text-[#9C9C9C] font-['Roboto']">Arrival:</span>
              <span className="text-[13px] text-[#37377B] font-['Baloo'] font-bold">
                {place.travelTime}
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#726E6E] flex items-center justify-center">
              <TimeClock className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none text-center gap-2">
              <span className="text-[12px] text-[#9C9C9C] font-['Roboto']">Time:</span>
              <span className="text-[13px] text-[#37377B] font-['Baloo'] font-bold">
                {place.arrivalTime}
              </span>
            </div>
          </div>
        </div>

        <button className="mt-3 w-fit bg-brand-dark text-white font-semibold py-2.5 px-5 rounded-[2.5rem] hover:bg-brand-dark/90">
          Lets Go
        </button>
      </div>
    ))}
  </div>
</div>

        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 px-8 pb-0">
        <div className="container mx-auto grid lg:grid-cols-4 gap-8 mb-10" >
          {/* Left Column */}
          <div className="lg:col-span-2 w-full max-w-[504px] space-y-10">
            {/* Weather */}
            <div className='flex flex-col gap-5'>
            <div className="bg-[#37377B] text-white rounded-[10px] p-6 w-full max-w-[504px]  shadow-xl">
  {/* Header */}
  <div className="flex justify-between items-start mb-4">
    <div>
      <p className="font-[Baloo] text-[21px] text-white">Current Weather</p>
      <div className="flex items-center mt-2">
        <div className=" w-[65px] h-[42px] rounded-md mr-3 flex items-center justify-center">
          <Cloud className="" />
        </div>
        <div className="flex items-start">
          <span className="text-[70px] font-[Baloo]  font-bold text-[#F8B528] leading-none">
            {weather.temp}
          </span>
        </div>
      </div>
    </div>
    <p className="text-[12px] text-white mt-2">Last updated {new Date(weather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
  </div>

  {/* Divider line */}
  <div className="border-t border-[#6F6FC1] my-4"></div>

  {/* Weather details */}
  <div className="grid grid-cols-2  gap-[20px] gap-y-2 text-[13px] font-[Roboto]">
    {/* Left side */}
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between">
        <span>Wind speed</span> <span className="text-[#F8B528]">{weather.wind}</span>
      </div>
      <div className="flex justify-between">
        <span>Pressure</span> <span className="text-[#F8B528]">{weather.pressure}</span>
      </div>
      <div className="flex justify-between">
        <span>Humidity</span> <span className="text-[#F8B528]">{weather.humidity}</span>
      </div>
      <div className="flex justify-between">
        <span>UV Index</span> <span className="text-[#F8B528]">{weather.uvIndex}</span>
      </div>
      <div className="flex justify-between">
        <span>Precipitation</span> <span className="text-[#F8B528]">{weather.precipitation}</span>
      </div>
      <div className="flex justify-between">
        <span>Air Quality</span> <span className="text-[#F8B528]">{weather.airQuality}</span>
      </div>
    </div>

    {/* Right side */}
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between">
        <span>Probability</span> <span className="text-[#F8B528]">{weather.probability}</span>
      </div>
      <div className="flex justify-between">
        <span>Dew Point</span> <span className="text-[#F8B528]">{weather.dewPoint}</span>
      </div>
      <div className="flex justify-between">
        <span>Cloud Cover</span> <span className="text-[#F8B528]">{weather.cloudCover}</span>
      </div>
      <div className="flex justify-between">
        <span>Visibility</span> <span className="text-[#F8B528]">{weather.visibility}</span>
      </div>
      <div className="flex justify-between">
        <span>Sunrise</span> <span className="text-[#F8B528]">{weather.sunrise}</span>
      </div>
      <div className="flex justify-between">
        <span>Sunset</span> <span className="text-[#F8B528]">{weather.sunset}</span>
      </div>
    </div>
  </div>
              </div>
            {/* Emergency Contacts */}
            <div>
              <h3 className="text-2xl font-bold text-center text-brand-dark mb-4">Emergency Contact Details</h3>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center">
                      <PhoneIcon className="mr-4 text-brand-dark" />
                      <span className="font-semibold text-brand-dark">{contact}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <ExternalLinkIcon className="text-brand-gray cursor-pointer" />
                      <ChevronDownIcon className="text-brand-gray cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            
          </div>

          {/* Right Column */}
          <div className="space-y-10 lg:col-span-2">
            {/* Map */}
            <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
  {mapInfo?.destinationCoordinates?.length === 2 ? (
        <iframe
          key={mapKey} // forces iframe reload on map update
          title="Destination Map"
          width="100%"
          height="400"
          className="rounded-2xl shadow-lg"
          loading="lazy"
          allowFullScreen
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
            mapInfo.destinationCoordinates[0] - 0.01
          }%2C${
            mapInfo.destinationCoordinates[1] - 0.01
          }%2C${
            mapInfo.destinationCoordinates[0] + 0.01
          }%2C${
            mapInfo.destinationCoordinates[1] + 0.01
          }&layer=mapnik&marker=${
            mapInfo.destinationCoordinates[1]
          }%2C${
            mapInfo.destinationCoordinates[0]
          }`}
        ></iframe>
      ) : (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          Loading map...
        </div>
      )}

  {mapInfo?.distance && (
    <div className="bg-brand-dark text-white p-4 flex justify-around items-center text-center">
      <div>
        <p className="text-xs text-gray-400">Distance</p>
        <p className="font-bold text-lg">{mapInfo.distance}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Expected Arrival</p>
        <p className="font-bold text-lg">{mapInfo.arrival}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Estimated Time</p>
        <p className="font-bold text-lg">{mapInfo.time}</p>
      </div>
    </div>
  )}
</div>



            
          </div>
        </div>
          
            <div className="flex flex-col md:flex-row w-full min-h-screen px-4 pb-0 md:px-12 py-8">
  {/* Hotels & Resorts */}
  <div
    className="flex-1 p-6 ml-[-170px] bg-cover bg-center shadow-md rounded-tl-none rounded-tr-[100px] pl-[120px] z-10 relative"
    style={{ backgroundImage: "url('/Destination_hotel.png')" }}
  >
    <h3 className="text-2xl font-bold text-brand-dark text-white mb-4">Hotels & Resorts</h3>
    <div className="space-y-4 max-h-[780px] overflow-y-auto pr-2">
  {hotels.map((hotel, index) => (
    <div
      key={index}
      className="flex bg-white shadow-md rounded-lg overflow-hidden"
    >
      {/* Left Image */}
      <div className="flex-shrink-0 w-56 h-52">
        <img
          src={hotel.img}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-between flex-grow p-4">
        <div>
          <h4 className="text-lg font-medium text-brand-dark">{hotel.name}</h4>
          <p className="text-sm text-gray-500">{hotel.location}</p>

          <div className="flex items-center gap-2 text-xs mt-2">
            <LocationPinIcon className="w-3 h-3 text-gray-400" />
            <span className="text-gray-700">{hotel.distance}</span>
            <a href="#" className="text-blue-600 underline ml-2">Show on map</a>
          </div>
        </div>

        {/* Bottom Row: Rating + Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center bg-yellow-400 text-gray-900 font-bold px-2 py-1 rounded-md">
            <StarIcon className="w-3 h-3 mr-1" /> {hotel.rating}
          </div>
          <button className="bg-brand-dark text-white font-semibold py-2 px-5 rounded-lg text-sm">
            View More
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

  </div>

  {/* Nearby Places */}
  <div
    className="flex-1 p-6 bg-cover bg-center shadow-md rounded-xl mt-0  relative z-0 ml-[-90px] pl-[100px]  mr-[-170px] "
    style={{ backgroundImage: "url('/Destination_nearby.png')",backgroundColor:"#EFEFFF" }}
  >
    <h3 className="text-2xl font-bold text-brand-dark  mb-4">Nearby Places</h3>
    <div className="space-y-4 max-h-[780px] overflow-y-auto pr-2">
      {places.map((place, index) => (
        <div>
          
      <div
        key={index}
        className="flex-shrink-0 w-[90%] bg-white  shadow-lg p-0 snap-start"
        style={{borderRadius:"0px 20px 20px 0px"}}
      >
        <div className='flex  flex-row gap-10'>
        <img 
          src={place.images[0]}
          alt={place.name}
          className="w-48 h-[210px] object-cover rounded-xl "
          style={{borderRadius:"20px 0px 0px 20px"}}
        />
        <div>
        <h3 className="text-lg pt-2 font-bold text-brand-dark">{place.name}</h3>
        <p className="text-xs text-brand-gray mb-3 truncate">
          {place.location }
        </p>

        <div className="text-xs text-brand-gray gap-[15px] flex justify-between border-t pt-2">
          {/* Distance */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#726E6E] flex items-center justify-center">
              <DistanceArrow className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none text-center gap-2">
              <span className="text-[12px] text-[#9C9C9C] font-['Roboto']">Distance</span>
              <span className="text-[13px] text-[#37377B] font-['Baloo'] font-bold">
                {place.distance}
              </span>
            </div>
          </div>

          {/* Arrival */}
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[60px] text-[#726E6E] flex items-center justify-center">
              <LocationWithTime className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none text-center gap-2">
              <span className="text-[12px] text-[#9C9C9C] font-['Roboto']">Arrival:</span>
              <span className="text-[13px] text-[#37377B] font-['Baloo'] font-bold">
                {place.travelTime}
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#726E6E] flex items-center justify-center">
              <TimeClock className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none text-center gap-2">
              <span className="text-[12px] text-[#9C9C9C] font-['Roboto']">Time:</span>
              <span className="text-[13px] text-[#37377B] font-['Baloo'] font-bold">
                {place.arrivalTime}
              </span>
            </div>
          </div>
        </div>

        <button className="mt-3 w-fit bg-brand-dark text-white font-semibold py-2.5 px-5 rounded-[2.5rem] hover:bg-brand-dark/90">
          Lets Go
        </button>
        </div>
        </div>
      </div>
      </div>
    ))}
    </div>
  </div>

            </div>

      </section>
    </div>
  );
};
