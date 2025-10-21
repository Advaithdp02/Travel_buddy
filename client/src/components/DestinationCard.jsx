import React, { useRef, useEffect, useState } from "react";
import { DiningHand } from "./Icons";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const hardcodedStats = [
  { count: "120+", label: "Tourist Spots" },
  { count: "90+", label: "Hotels" },
  { count: "80+", label: "Restaurants" },
];

export default function DestinationCard() {
  const containerRef = useRef(null);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`);
        // Map the API data to the shape used in the cards
        const data = res.data.map((d) => ({
          name: d.name,
          image: d.imageURL || "/Service.png",
          description: `Explore the beautiful district of ${d.name}`,
          stats: hardcodedStats,
        }));
        setDestinations(data);
      } catch (err) {
        console.error("Failed to fetch destinations:", err);
      }
    };
    fetchDestinations();
  }, []);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 320;
      containerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
    
      {/* Scrollable cards container */}
      <div ref={containerRef} className="flex gap-6 overflow-x-auto scrollbar-hide px-4">
        {destinations.map((dest, index) => (
          <div
            key={index}
            className="w-[315px] h-[354px] bg-white rounded-xl shadow-md relative overflow-hidden flex-shrink-0"
          >
            <div className="w-full h-[216px] bg-gray-300 relative">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover rounded-t-xl"
              />
              <div className="absolute bottom-0 w-full h-[53px] bg-gradient-to-t from-black/80 to-transparent"></div>
              <h2
                className="text-white text-xl font-normal absolute left-4"
                style={{ top: "187px" }}
              >
                {dest.name}
              </h2>
            </div>

            <div className="p-4">
              {/* Description */}
                <p className="text-gray-900 text-sm truncate">
                  {dest.description}
                </p>


              <div className="flex items-start mt-3 text-gray-600 text-xs relative">
                {dest.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center px-3 relative ${idx === 0 ? "pl-0" : ""}`}
                  >
                    <div className="flex-shrink-0">
                      <DiningHand className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{stat.label}</span>
                      <span className="text-[14px] font-normal text-[#37377B]">{stat.count}</span>
                    </div>
                    {idx !== dest.stats.length - 1 && (
                      <div className="absolute right-0 top-0 h-[25px] border-r border-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>

              <button className="mt-4 bg-[#37377B] text-white text-sm py-2 px-6 rounded-full hover:bg-[#5050A0]">
                LETS GO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
