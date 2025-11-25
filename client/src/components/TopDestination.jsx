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

  const scrollRef = useRef(null);
  const CARD_WIDTH = 320;
  const GAP = 24; 

  // ===========================
  // 1) Fetch Data from Backend
  // ===========================
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!userCoords) return;

      try {
        const { latitude, longitude } = userCoords;

        const res = await fetch(
          `${BACKEND_URL}/districts/nearest/${latitude}/${longitude}`
        );
        const data = await res.json();

        if (data?.orderedDistricts) {
          setDestinations(data.orderedDistricts);
          setNearestCode(data.nearestDistrict?.DistrictCode);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDestinations();
  }, [userCoords]);

  // ===========================
  // Infinite Scroll Setup
  // ===========================
  const fullList = [...destinations, ...destinations, ...destinations];
  const middleIndex = destinations.length; 

  useEffect(() => {
    if (!scrollRef.current || destinations.length === 0) return;

    const startScroll =
      middleIndex * (CARD_WIDTH + GAP)-40; 

    scrollRef.current.scrollLeft = startScroll;
  }, [destinations]);

  // ===========================
  // Auto Recenter to Middle
  // ===========================
  const handleInfiniteScroll = () => {
    if (!scrollRef.current || destinations.length === 0) return;

    const totalWidth = fullList.length * (CARD_WIDTH + GAP);
    const oneBatchWidth = destinations.length * (CARD_WIDTH + GAP);

    const current = scrollRef.current.scrollLeft;

    if (current <= oneBatchWidth * 0.3) {
      scrollRef.current.scrollLeft = current + oneBatchWidth;
    }

    if (current >= oneBatchWidth * 2.7) {
      scrollRef.current.scrollLeft = current - oneBatchWidth;
    }
  };

  // ===========================
  // Manual Scroll Buttons
  // ===========================
  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = CARD_WIDTH + GAP;

    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="flex flex-col md:-ml-[60px] md:flex-row items-start justify-between bg-cover bg-center text-white py-16 overflow-visible"
      style={{ backgroundImage: `url(/TopDestinationBG.png)` }}
    >
      <div className="relative z-10 overflow-hidden w-full max-w-7xl mx-auto px-6">
        {/* Heading */}
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

        {/* Infinite Scroll Cards */}
        <div
          ref={scrollRef}
          onScroll={handleInfiniteScroll}
          className="flex flex-row gap-6 overflow-x-scroll hide-scrollbar flex-nowrap"
        >
          {fullList.map((dest, i) => (
            <div key={i} className="flex-shrink-0">
              <DestinationCard
                destination={dest}
                isNearest={dest.DistrictCode === nearestCode}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
