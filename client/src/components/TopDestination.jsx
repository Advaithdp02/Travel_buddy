import React, { useRef, useState } from "react";
import DestinationCard from "./DestinationCard";
import { IconArrowRight, IconArrowLeft } from "./icons";

// Reusable ArrowButton
const ArrowButton = ({ direction = "right", onClick }) => {
  const Icon = direction === "right" ? IconArrowRight : IconArrowLeft;
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

export const TopDestinations=() =>{
  const bgImage = "/TopDestinationBG.png";
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // width of one card + gap
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
      

      {/* Content */}
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
            <ArrowButton direction="right" onClick={() => scroll("left")} />
            <ArrowButton direction="left" onClick={() => scroll("right")} />
          </div>
        </div>

        {/* Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide"
        >
          <DestinationCard />
        </div>
      </div>
    </section>
  );
}
