import React from "react";
import { DiningHand } from "./Icons";

export default function DestinationCard({ destination }) {
  const hardcodedStats = [
    { count: "120+", label: "Tourist Spots" },
    { count: "90+", label: "Hotels" },
    { count: "80+", label: "Restaurants" },
  ];

  return (
    <div className="w-[315px] h-[354px] bg-white rounded-xl shadow-md relative overflow-hidden flex-shrink-0">
      <div className="w-full h-[216px] bg-gray-300 relative">
        <img
          src={destination.imageURL || `/Service.png`}
          alt={destination.name}
          className="w-full h-full object-cover rounded-t-xl"
        />
        <div className="absolute bottom-0 w-full h-[53px] bg-gradient-to-t from-black/80 to-transparent"></div>
        <h2
          className="text-white text-xl font-normal absolute left-4"
          style={{ top: "187px" }}
        >
          {destination.name}
        </h2>
      </div>

      <div className="p-4">
        <p className="text-gray-900 text-sm truncate">
          Explore the beautiful district of {destination.name}
        </p>

        <div className="flex items-start mt-3 text-gray-600 text-xs relative">
          {hardcodedStats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex items-center px-3 relative ${idx === 0 ? "pl-0" : ""}`}
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
              {idx !== hardcodedStats.length - 1 && (
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
  );
}
