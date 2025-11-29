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
          one place. Whether you're planning a trip or already on the go, we help
          you navigate, explore, and find the best options.
        </p>

        {/* Features */}
        <div className="flex flex-col md:flex-row gap-8 mt-10 text-left justify-center md:justify-start">

          {/* Must Visit Places */}
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <LocationIcon className="opacity-70 text-white" />
            <div>
              <h5 className="font-semibold">Must-Visit Places</h5>
              <p className="text-gray-300 text-sm">
                Explore top attractions and hidden gems near you.
              </p>
            </div>
          </div>

          {/* Climate */}
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <ClimateIcon className="opacity-70 text-white" />
            <div>
              <h5 className="font-semibold">Weather Updates</h5>
              <p className="text-gray-300 text-sm">
                Stay informed about the latest climate conditions.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
