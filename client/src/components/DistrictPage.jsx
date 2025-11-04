import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StarIcon,
  CheckIcon,
  DistanceArrow,
  TimeClock,
  LocationWithTime,
} from "./Icons"; 
import CommunityModal from "../components/CommunityModal";

export const DistrictPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [district, setDistrict] = useState(null);
  const [comments, setComments] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [filters, setFilters] = useState({
    state: "Kerala",
    district: "",
    terrain: "Mountain",
  });
  const [activeTab, setActiveTab] = useState("comments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allDistricts, setAllDistricts] = useState([]);

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

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
  const fetchAllData = async () => {
    try {
      // 🏙 Fetch the selected district
      const districtRes = await axios.get(`${BACKEND_URL}/districts/${id}`);
      const districtData = districtRes.data;
      setDistrict(districtData);

      // Update filters with district and state
      setFilters((f) => ({
        ...f,
        district: districtData.name,
        state: districtData.State,
      }));

      // 💬 Fetch comments
      const commentsRes = await axios.get(
        `${BACKEND_URL}/comments/district/${id}`
      );
      setComments(commentsRes.data);

      // 🙌 Fetch contributions
      const contribRes = await axios.get(
        `${BACKEND_URL}/contributions/district/${id}`
      );
      setContributions(contribRes.data);

      // 🌍 Fetch all districts (for the dropdown filter)
      const allDistrictsRes = await axios.get(`${BACKEND_URL}/districts`);
      setAllDistricts(allDistrictsRes.data);

      // 📍 Fetch locations inside this district
      const locRes = await axios.get(
        `${BACKEND_URL}/locations/district/${districtData.name}`
      );
      const locData = locRes.data;

      // 🧭 Enrich places with distance/time
      const userCoords = JSON.parse(
        localStorage.getItem("userCoords") || '{"latitude":0,"longitude":0}'
      );
      const origin = { lat: userCoords.latitude, lon: userCoords.longitude };

      const enrichedPlaces = (locData || []).map((place) => {
        const [lon, lat] = place.coordinates.coordinates;
        const distance = calculateDistance(origin.lat, origin.lon, lat, lon);
        const travelTime = calculateTime(distance);
        const now = new Date();
        const timeHours = distance / 60;
        const arrival = new Date(now.getTime() + timeHours * 3600 * 1000);
        const arrivalTime = arrival.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return {
          ...place,
          distance: `${distance.toFixed(2)} km`,
          travelTime,
          arrivalTime,
        };
      });

      setPlaces(enrichedPlaces);
    } catch (err) {
      console.error("Error fetching district data:", err);
    }
  };

  fetchAllData();
}, [id]);
useEffect(() => {
  const fetchLocationsByDistrict = async () => {
    if (!filters.district) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/locations/district/${filters.district}`
      );
      const data = await res.json();

      const userCoords = JSON.parse(
        localStorage.getItem("userCoords") || '{"latitude":0,"longitude":0}'
      );

      const origin = { lat: userCoords.latitude, lon: userCoords.longitude };

      const enrichedPlaces = (data || []).map((place) => {
        const [lon, lat] = place.coordinates.coordinates; // GeoJSON: [lon, lat]
        const distance = calculateDistance(origin.lat, origin.lon, lat, lon);
        const travelTime = calculateTime(distance);

        const now = new Date();
        const timeHours = distance / 60; // Approx 60 km/h avg
        const arrival = new Date(now.getTime() + timeHours * 3600 * 1000);
        const arrivalTime = arrival.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return {
          ...place,
          distance: `${distance.toFixed(2)} km`,
          travelTime,
          arrivalTime,
        };
      });

      setPlaces(enrichedPlaces);
    } catch (err) {
      console.error("Error fetching locations by district:", err);
    }
  };

  fetchLocationsByDistrict();
}, [filters.district]);


  if (!district)
    return <div className="text-center py-20 text-gray-600">Loading...</div>;

  const hero = {
    bgImg: district.imageURL || "/default-bg.jpg",
    title: district.state || "Kerala",
    subtitle: district.name,
  };

  const about = {
    images: [district.imageURL || "/default-district.jpg", "/fallback.jpg"],
    rating: district.rating || "4.5",
    reviews: district.reviews || 123,
    heading: "About the District",
    subtitle: district.name || "",
    description:
      district.description ||
      "Discover the beauty, culture, and heritage of this district.",
    points: [
      "Rich biodiversity and scenic landscapes",
      "Cultural heritage and historic temples",
      "Famous local cuisine and festivals",
    ],
  };

  return (
    <>
      {/* 🌅 Hero Section */}
      <section className="relative h-[60vh] w-full flex items-center px-8 ">
        <div
          className="absolute inset-0 rounded-[20px] bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.bgImg})` }}
        ></div>
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-transparent to-[#8B63DA]"></div>

        <div className="relative z-10 text-left max-w-[724px] left-[25px] px-4">
          <h3 className="text-[#F2B024] font-schoolbell text-[30px] leading-[42px]">
            {hero.title}
          </h3>
          <h1 className="text-white font-poppins text-[65px] leading-[70px] mt-2">
            {hero.subtitle}
          </h1>
        </div>
      </section>

      {/* 🏞 About Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96">
            <img
              src={about.images[0]}
              alt="District"
              className="absolute top-0 left-0 w-2/3 h-full object-cover rounded-xl shadow-lg"
            />
            <img
              src={about.images[1]}
              alt="District detail"
              className="absolute bottom-0 right-0 w-1/2 border-8 border-white rounded-xl shadow-2xl"
            />
            <div className="absolute top-4 right-8 bg-white/90 p-3 rounded-lg shadow-lg flex items-center space-x-2">
              <StarIcon className="text-yellow-400" />
              <span className="font-bold text-brand-dark">{about.rating}</span>
              <span className="text-xs text-brand-gray">
                Based on {about.reviews} Reviews
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[#3F3F3F] font-schoolbell text-[30px] leading-[42px]">
              {about.heading}
            </h2>
            <p className="text-[#9156F1] font-poppins text-[40px] leading-[50px] my-3">
              {about.subtitle}
            </p>

            <p className="text-[#310a49] font-roboto text-[12px] leading-[23px] mb-6">
              {about.description}
            </p>

            <ul className="space-y-3 text-[#310a49] mb-8">
              {about.points.map((p, idx) => (
                <li key={idx} className="flex items-start ">
                  <CheckIcon className="text-[#9156F1] mr-2 mt-1 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            
          </div>
        </div>
      </section>

      {/* 💬 Comments & Contributions */}
      <section className="py-16 px-8 bg-[#fbebff] ">
  <div className="container mx-auto">
    <h2 className="text-3xl font-bold text-brand-dark mb-6">Community Insights</h2>

    {/* Tabs */}
    <div className="flex gap-6 mb-8 border-b border-gray-200">
      <button
        onClick={() => setActiveTab("comments")}
        className={`pb-2 font-semibold transition-colors ${
          activeTab === "comments"
            ? "border-b-2 border-[#9156F1] text-brand-dark"
            : "text-brand-gray"
        }`}
      >
        Comments
      </button>
      <button
        onClick={() => setActiveTab("contributions")}
        className={`pb-2 font-semibold transition-colors ${
          activeTab === "contributions"
            ? "border-b-2 border-[#9156F1] text-brand-dark"
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
          <div className="space-y-4 h-[300px] overflow-y-auto">
            {comments.length === 0 && (
              <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center">
                <span className="text-gray-500">No comments yet</span>
                
              </div>
            )}

            {comments.length > 0 &&
              comments.map((c, index) => (
                <div
                  key={c._id || index}
                  className="bg-white p-4 rounded-xl shadow border border-gray-100 cursor-pointer flex gap-3 hover:shadow-md transition"
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
              <></>
            )}
          </div>
        </div>

        {/* -------------------- CONTRIBUTIONS TAB -------------------- */}
        <div className="w-full pl-6">
          <div className="space-y-4 h-[300px] overflow-y-auto">
            {contributions.length === 0 ? (
              <div className="bg-white p-4 rounded-xl shadow border border-gray-100 text-gray-500">
                No contributions yet
              </div>
            ) : (
              contributions.map((c, index) => (
                <div
                  key={c._id || index}
                  className="bg-white p-4 rounded-xl shadow border border-gray-100 cursor-pointer hover:shadow-md transition"
                  onClick={() => setIsModalOpen(true)}
                >
                  {/* Cover Image */}
                  {c.coverImage && (
                    <img
                      src={c.coverImage}
                      alt="Contribution cover"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}

                  {/* Description / Preview */}
                  <h4 className="font-semibold text-brand-dark text-lg">
                    {c.location?.name || "Contribution"}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {c.description || "No description provided."}
                  </p>

                  {/* Meta Info */}
                  <div className="text-xs text-brand-gray mt-2 flex justify-between items-center">
                    <span>
                      Shared by{" "}
                      <strong>
                        {c.user?.name || c.user?.username || "Unknown User"}
                      </strong>
                    </span>
                    {c.bestTimeToVisit && (
                      <span className="text-[11px] text-gray-500 italic">
                        Best time: {c.bestTimeToVisit}
                      </span>
                    )}
                  </div>

                  {/* Likes */}
                  <div className="mt-2 text-xs text-gray-500">
                    ❤️ {c.likes?.length || 0}{" "}
                    {c.likes?.length === 1 ? "like" : "likes"}
                  </div>
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
        districtPage={true}
      />
      {/* Filter & Places Section */}
            {/* 🌍 Filter Section */}
<section className="bg-[#fbebff] py-12 px-8">
  <div className="container mx-auto">
    <div className="bg-[#310a49] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 mb-10">
      <span className="text-white text-2xl font-bold">Filter</span>
      <div className="flex-grow flex flex-wrap items-center gap-4">
        {/* 🏠 State Selector */}
        <select
          className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto"
          value={filters.state}
          onChange={(e) => {
            const selectedState = e.target.value;
            setFilters({
              ...filters,
              state: selectedState,
              district: "", // reset district
            });
          }}
        >
          <option value="">Select State</option>
          {[
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Delhi",
            "Jammu and Kashmir",
            "Ladakh",
          ].map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* 📍 District Selector */}
        <select
          className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto"
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
        >
          <option value="">Select District</option>
          {allDistricts
            .filter((d) => d.State === filters.state)
            .map((district) => (
              <option key={district._id} value={district.name}>
                {district.name}
              </option>
            ))}
        </select>

        {/* 🏔 Terrain */}
        <select
          className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto"
          value={filters.terrain}
          onChange={(e) => setFilters({ ...filters, terrain: e.target.value })}
        >
          <option>Mountain</option>
          <option>Beach</option>
          <option>Forest</option>
          <option>Desert</option>
          <option>Valley</option>
        </select>
      </div>

      <button className="bg-[#9156F1] text-white font-bold py-3 px-8 rounded-lg w-full sm:w-auto">
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
      
              <button className="mt-3 w-fit bg-[#9156F1] text-white font-semibold py-2.5 px-5 rounded-[2.5rem] hover:bg-brand-dark/90" onClick={()=>{navigate(`/destination/${place._id}`);window.scrollTo(0, 0);}}>
                Lets Go
              </button>
            </div>
          ))}
        </div>
      </div>
      
              </div>
            </section>
      
    </>
  );
};
