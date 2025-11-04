import React from "react";
import { useNavigate } from "react-router-dom";

export const Home = ({nearestLocation}) => {
  const navigate = useNavigate();

  return (
    <section
  id="home"
  className="w-full px-10 font-poppins flex flex-col md:flex-row lg:flex-row items-center justify-between md:pr-0 md:pl-20 lg:pr-0 lg:pl-50  bg-[#fbebff]"
>


      {/* ===== Left Text Section ===== */}
      <div className="flex flex-col justify-center w-full md:w-2/3 max-w-[800px]">
        {/* Subtitle */}
        <p className="text-[#9156F1] text-lg font-semibold mb-2">
          Explore the world
        </p>

        {/* Heading */}
        <h1 className="text-[#1D1D51] text-4xl md:text-6xl font-extrabold leading-tight">
          It’s Time to <br />
          Travel Around <br />
          the World
        </h1>

        {/* Paragraph */}
        <p className="text-[#310a49] text-base md:text-lg mt-4 max-w-[600px]">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Discover beautiful places, plan your next adventure, and
          make memories that last forever.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("destination/{}".replace("{}", nearestLocation || ""))}
          className="mt-8 w-[180px] h-[48px] bg-[#9156F1] text-white font-roboto rounded-full shadow-md hover:bg-[#2b2b70] transition-all duration-300"
        >
          EXPLORE NOW
        </button>
      </div>

      {/* ===== Right Image Section ===== */}
      <div className="flex justify-center items-center w-[700px] mt-5 mb-5  md:mt-0  md:border-l-0 ml-0">
        <img  src="./home_design_1.png"     alt="Travel"  className="max-h-[600px] w-auto object-contain transform transition-transform duration-300 ease-in-out hover:scale-105"
        />
       </div>



    </section>

  );
};
