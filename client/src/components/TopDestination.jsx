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
      className="w-[35px] h-[35px] rounded-full bg-black flex items-center justify-center transition-colors"
    >
      <Icon hover={hover} />
    </button>
  );
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const TopDestinations = ({ userCoords }) => {
  const [destinations, setDestinations] = useState([]);
  const [nearestCode, setNearestCode] = useState(null);
  const scrollContainerRef = useRef(null);
  const bgImage = "/TopDestinationBG.png";

  // ===========================
  // 1) Fetch Data
  // ===========================
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        if (!userCoords) return;
        
        const { latitude, longitude } = userCoords

        const res = await fetch(
          `${BACKEND_URL}/districts/nearest/${latitude}/${longitude}`
        );

        const data = await res.json();

        // Backend returns:
        // { nearestDistrict: {...}, orderedDistricts: [...] }

        if (data?.orderedDistricts) {
          setDestinations(data.orderedDistricts);
          setNearestCode(data.nearestDistrict?.DistrictCode);
        } else {
          setDestinations([]);
        }
      } catch (err) {
        console.error("Failed to fetch nearest destinations:", err);
      }
    };

    fetchDestinations();
  }, [userCoords]);

  // ===========================
  // 2) Auto Scroll to nearest district
  // ===========================
 useEffect(() => {
  if (!nearestCode || destinations.length === 0 || !scrollContainerRef.current) return;

  const index = destinations.findIndex(
    (d) => d.DistrictCode === nearestCode
  );

  if (index !== -1) {
    const CARD_WIDTH = 320;
    const OFFSET = 150; // adjust this

    let scrollAmount;

    if (index === 0) {
      // First element → no offset
      scrollAmount = 0;
    } else {
      // Shift slightly
      scrollAmount = index * CARD_WIDTH - OFFSET;

      // Prevent showing previous card
      const minAllowed = index * CARD_WIDTH;

      if (scrollAmount < minAllowed) {
        scrollAmount = minAllowed;
      }
    }

    scrollContainerRef.current.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  }
}, [nearestCode, destinations]);


  // ===========================
  // 3) Manual Scroll Buttons
  // ===========================
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
      className="flex flex-col md:-ml-[60px] md:flex-row items-start justify-between bg-cover bg-center text-white py-16 overflow-visible"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="relative z-10 overflow-hidden w-full max-w-7xl mx-auto px-6">
        
        {/* Heading + Buttons */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-schoolbell text-[#F2B024] text-3xl md:text-4xl">
              Top Destination
            </h2>
            <p className="font-poppins text-white text-4xl md:text-5xl mt-2">
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
          className="flex flex-row gap-6 overflow-x-scroll hide-scrollbar flex-nowrap"
        >
          {destinations.length > 0 ? (
            destinations.map((dest) => (
              <div key={dest._id} className="flex-shrink-0">
                <DestinationCard 
                  destination={dest}
                  isNearest={dest.DistrictCode === nearestCode} 
                />
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
