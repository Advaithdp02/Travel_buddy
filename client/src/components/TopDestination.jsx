import React, { useRef, useState, useEffect } from "react";
import DestinationCard from "./DestinationCard";
import { IconArrowRight, IconArrowLeft } from "./Icons";

const ArrowButton = ({ direction = "right", onClick }) => {
  const Icon = direction === "right" ? IconArrowLeft : IconArrowRight;
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-[35px] h-[35px] rounded-full bg-[#37377B] flex items-center justify-center transition-colors"
    >
      <Icon hover={hover} />
    </button>
  );
};

// 🔹 Utility: Calculate distance between two coordinates (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const TopDestinations = ({ userCoords }) => {
  const [destinations, setDestinations] = useState([]);
  const scrollContainerRef = useRef(null);
  const bgImage = "/TopDestinationBG.png";

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/districts`);
        const data = await res.json();

        if (userCoords && Array.isArray(data)) {
          const sorted = data
            .map((loc) => ({
              ...loc,
              distance: getDistance(
                userCoords.latitude,
                userCoords.longitude,
                loc.coordinates?.coordinates?.[1], // latitude
                loc.coordinates?.coordinates?.[0]  // longitude
              ),
            }))
            .sort((a, b) => a.distance - b.distance); // nearest first

          setDestinations([...sorted]); // force re-render
          
        } else {
          setDestinations(data);
        }
      } catch (err) {
        console.error("Failed to fetch destinations:", err);
      }
    };
    fetchDestinations();
  }, [userCoords]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="w-screen flex flex-col md:-ml-[60px] md:flex-row items-start justify-between bg-cover bg-center text-white py-16 overflow-visible"
      style={{ backgroundImage: `url(${bgImage})`, height: "650px" }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* Heading + Buttons */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-schoolbell text-[#F2B024] text-3xl md:text-4xl">
              Top Destination
            </h2>
            <p className="font-baloo text-white text-4xl md:text-5xl mt-2">
              Explore Top Destinations
            </p>
          </div>

          <div className="flex gap-2">
            <ArrowButton direction="left" onClick={() => scroll("left")} />
            <ArrowButton direction="right" onClick={() => scroll("right")} />
          </div>
        </div>

        {/* Cards */}
        <div
          ref={scrollContainerRef}
          className="flex flex-row gap-6 overflow-x-auto scrollbar-hide flex-nowrap"
        >
          {destinations.length > 0 ? (
            destinations.map((dest) => (
              <div key={dest._id} className="flex-shrink-0">
                <DestinationCard destination={dest} />
              </div>
            ))
          ) : (
            <p className="text-gray-300">Loading destinations...</p>
          )}
        </div>
      </div>
    </section>
  );
};
