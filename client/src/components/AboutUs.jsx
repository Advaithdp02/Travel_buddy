import React from "react";
import { useNavigate } from "react-router-dom";
// your tracking hook

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AboutUs = () => {


  

  return (
    <section
      id="aboutUs"
      className="relative w-screen flex flex-col md:-ml-[60px] md:flex-row items-center justify-between bg-gradient-to-r from-[#CB98ED] via-[#8B63DA] to-[#3C21B7] text-white  pb-0 mb-[-5] h-[900px] pb-[10px] md:pb-0 md:h-[464px] gap-10 md:gap-0 overflow-visible"
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
          Committed to Your Travel Adventure Experience
        </h2>
        <p className="text-gray-200 text-sm md:text-base">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s...
        </p>

        {/* Features */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <div className="flex items-start gap-4">
            <img
              src="./feature1.png"
              alt="Feature 1"
              className="w-16 h-16 border border-white rounded-full p-2"
            />
            <div>
              <h5 className="font-semibold">Feature 1</h5>
              <p className="text-gray-300 text-sm">Description of feature 1</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <img
              src="./feature2.png"
              alt="Feature 2"
              className="w-16 h-16 border border-white rounded-full p-2"
            />
            <div>
              <h5 className="font-semibold">Feature 2</h5>
              <p className="text-gray-300 text-sm">Description of feature 2</p>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};
