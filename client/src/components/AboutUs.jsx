import React from "react";
import { LocationIcon, ClimateIcon } from "./Icons";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AboutUs = () => {
  return (
    <section
      id="aboutUs"
      className="relative md:w-[100vh] lg:w-[100vw] flex flex-col md:flex-row items-center justify-center 
      bg-gradient-to-r from-[#CB98ED] via-[#8B63DA] md:ml-[-60px] to-[#3C21B7] md:mr-[-60px]
      text-white py-14 md:py-20 overflow-visible"
    >
      {/* Center Wrapper */}
      <div className="max-w-3xl w-full text-center md:text-left px-6 md:px-0">
        <h4 className="text-yellow-400 font-schoolbell text-2xl mb-2">
          About Us
        </h4>

        <h2 className="text-3xl md:text-4xl font-poppins font-bold">
          TravelBuddy – Your Travel Partner
        </h2>

        <p className="text-gray-200 text-sm md:text-base mt-4 leading-relaxed">
          TravelBuddy makes traveling easier by providing everything you need in
          one place. Whether you're planning a trip or already on the go, we
          help you navigate, explore, and find the best options.
        </p>
      </div>
    </section>
  );
};
