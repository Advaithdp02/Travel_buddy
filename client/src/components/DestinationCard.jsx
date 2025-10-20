import React,{ useRef } from "react";
import { DiningHand,Tourist_places,Hotel_card_icon} from "./icons";

const destinations = [
  {
    name: "Kozhikode",
    image: "/Service.png",
    description: "Enjoy the beauty of Kozhikode",
    stats: [
      { count: "120+", label: "Tourist Spots" },
      { count: "90+", label: "Hotels" },
      { count: "80+", label: "Restaurants" },
    ],
  },
  {
    name: "Thiruvananthapuram",
    image: "/Service.png",
    description: "Explore the capital city of Kerala",
    stats: [
      { count: "150+", label: "Tourist Spots" },
      { count: "110+", label: "Hotels" },
      { count: "100+", label: "Restaurants" },
    ],
  },
  {
    name: "Ernakulam",
    image: "/Service.png",
    description: "Discover the vibrant city of Ernakulam",
    stats: [
      { count: "140+", label: "Tourist Spots" },
      { count: "120+", label: "Hotels" },
      { count: "95+", label: "Restaurants" },
    ],
  },
  {
    name: "Alappuzha",
    image: "/Service.png",
    description: "Enjoy the backwaters of Alappuzha",
    stats: [
      { count: "100+", label: "Tourist Spots" },
      { count: "80+", label: "Hotels" },
      { count: "70+", label: "Restaurants" },
    ],
  },
  {
    name: "Kollam",
    image: "/Service.png",
    description: "Explore the scenic beauty of Kollam",
    stats: [
      { count: "90+", label: "Tourist Spots" },
      { count: "70+", label: "Hotels" },
      { count: "60+", label: "Restaurants" },
    ],
  },
  {
    name: "Pathanamthitta",
    image: "/Service.png",
    description: "Experience the spiritual side of Kerala",
    stats: [
      { count: "80+", label: "Tourist Spots" },
      { count: "50+", label: "Hotels" },
      { count: "40+", label: "Restaurants" },
    ],
  },
  {
    name: "Idukki",
    image: "/Service.png",
    description: "Enjoy the hills and wildlife of Idukki",
    stats: [
      { count: "110+", label: "Tourist Spots" },
      { count: "60+", label: "Hotels" },
      { count: "50+", label: "Restaurants" },
    ],
  },
  {
    name: "Wayanad",
    image: "/Service.png",
    description: "Discover the lush greenery of Wayanad",
    stats: [
      { count: "130+", label: "Tourist Spots" },
      { count: "70+", label: "Hotels" },
      { count: "60+", label: "Restaurants" },
    ],
  },
  {
    name: "Malappuram",
    image: "/Service.png",
    description: "Explore the cultural heritage of Malappuram",
    stats: [
      { count: "95+", label: "Tourist Spots" },
      { count: "60+", label: "Hotels" },
      { count: "55+", label: "Restaurants" },
    ],
  },
  {
    name: "Palakkad",
    image: "/Service.png",
    description: "Visit the gateway of Kerala, Palakkad",
    stats: [
      { count: "85+", label: "Tourist Spots" },
      { count: "55+", label: "Hotels" },
      { count: "50+", label: "Restaurants" },
    ],
  },
  {
    name: "Thrissur",
    image: "/Service.png",
    description: "Experience the cultural capital of Kerala",
    stats: [
      { count: "120+", label: "Tourist Spots" },
      { count: "80+", label: "Hotels" },
      { count: "70+", label: "Restaurants" },
    ],
  },
  {
    name: "Kannur",
    image: "/Service.png",
    description: "Enjoy the beaches and forts of Kannur",
    stats: [
      { count: "100+", label: "Tourist Spots" },
      { count: "60+", label: "Hotels" },
      { count: "55+", label: "Restaurants" },
    ],
  },
  {
    name: "Kasargod",
    image: "/Service.png",
    description: "Explore the northernmost district of Kerala",
    stats: [
      { count: "70+", label: "Tourist Spots" },
      { count: "40+", label: "Hotels" },
      { count: "35+", label: "Restaurants" },
    ],
  },
  {
    name: "Kottayam",
    image: "/Service.png",
    description: "Discover the backwaters and hills of Kottayam",
    stats: [
      { count: "90+", label: "Tourist Spots" },
      { count: "50+", label: "Hotels" },
      { count: "45+", label: "Restaurants" },
    ],
  },
];


export default function DestinationCard() {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 320; // width of one card + gap
      containerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <div className="absolute right-0 top-1/2 z-20 flex gap-2">
        <button
          onClick={() => scroll("left")}
          className="w-[35px] h-[35px] rounded-full bg-[#37377B] hover:bg-[#F2B024] flex items-center justify-center transition-colors"
        >
          &lt;
        </button>
        <button
          onClick={() => scroll("right")}
          className="w-[35px] h-[35px] rounded-full bg-[#37377B] hover:bg-[#F2B024] flex items-center justify-center transition-colors"
        >
          &gt;
        </button>
      </div>

      {/* Scrollable cards container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4"
      >
        {destinations.map((dest, index) => (
          <div
            key={index}
            className="w-[315px] h-[354px] bg-white rounded-xl shadow-md relative overflow-hidden flex-shrink-0"
          >
            {/* Image Section */}
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

            {/* Description */}
            <div className="p-4">
              <p className="text-gray-900 text-sm">{dest.description}</p>

              {/* Stats Section */}
              <div className="flex items-start mt-3 text-gray-600 text-xs relative">
                {dest.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center px-3 relative ${
                      idx === 0 ? "pl-0" : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <DiningHand className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {stat.label}
                      </span>
                      <span className="text-[14px] font-normal text-[#37377B]">
                        {stat.count}
                      </span>
                    </div>
                    {idx !== dest.stats.length - 1 && (
                      <div className="absolute right-0 top-0 h-[25px] border-r border-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Button */}
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