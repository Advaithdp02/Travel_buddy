import React from "react";
import {LocationIcon,ClimateIcon} from "./Icons"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AboutUs = () => {


  

  return (
    <section
      id="aboutUs"
      className="relative flex flex-col md:-ml-[60px] md:flex-row items-center justify-between bg-gradient-to-r from-[#CB98ED] via-[#8B63DA] to-[#3C21B7] text-white  pb-0 mb-[-5]  pb-[10px] md:pb-0 md:h-[464px] gap-10 md:gap-0 overflow-visible"
    >
      {/* Left Side */}
      <div className="relative md:w-1/2 flex justify-center md:justify-start pt-16 mb-10 md:mb-0 overflow-visible md:left-[160px]">
        <img
          src="./AboutUs.png"
          alt="Traveler with Suitcase"
          className="relative z-10 w-64 md:w-80 lg:w-[400px] -mb-10 md:-mb-0"
        />
      </div>

      {/* Right Side */}
      <div className="md:w-1/2 space-y-6 px-6 md:px-0">
        <h4 className="text-yellow-400 font-schoolbell text-2xl">About Us</h4>
        <h2 className="text-3xl md:text-4xl font-poppins font-bold">
          TravelBuddy – Your Travel Partner
        </h2>
        <p className="text-gray-200 text-sm md:text-base">
         TravelBuddy makes traveling easier by providing everything you need in one place. Whether you're planning a trip or already on the go, we help you navigate, explore, and find the best options.    </p>

        {/* Features */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <div className="flex items-start gap-4">
            <LocationIcon  className="icon-centered"/>
            <div>
              <h5 className="font-semibold">Must-Visit Places</h5>
              <p className="text-gray-300 text-sm"> Explore top attractions and hidden gems near you.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ClimateIcon />
            <div>
              <h5 className="font-semibold">Weather Updates</h5>
              <p className="text-gray-300 text-sm">Stay informed about the latest climate conditions.</p>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};
