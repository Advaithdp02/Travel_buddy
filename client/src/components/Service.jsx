import React from "react";
import {ClimateIcon,LocationIcon,PlacesIcon,HotelsIcon,TrafficIcon} from "./icons";


export const Service = () => {
  const services = [
    { icon: <ClimateIcon />, title: "Climate", subtitle: "Description about Climate" },
    { icon: <LocationIcon />, title: "Location", subtitle: "Description about Location" },
    { icon: <PlacesIcon />, title: "Places", subtitle: "Description about Places" },
    { icon: <HotelsIcon />, title: "Hotels", subtitle: "Description about Hotels" },
    { icon: <TrafficIcon />, title: "Traffic", subtitle: "Description about Traffic" },
  ];
  const value={
    Happy_travellers:9867,
    Tourist_places:8567,
    Number_of_resorts:9684,
    Fun_experiences:6874
  }

  return (
    <>    <section id="services" className="relative w-full flex flex-col md:flex-row items-start bg-white py-20 gap-10 px-6 md:px-20">
      
      {/* Left Content */}
      <div className="md:w-2/3 relative flex flex-col gap-6">
        {/* Our Services title */}
        <h4 className="text-yellow-500 font-schoolbell text-3xl">Our Services</h4>
        
        {/* Main Heading */}
        <h2 className="text-gray-800 font-baloo text-4xl md:text-5xl font-medium leading-snug">
          Your Gateway to Unforgettable Journeys
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm md:text-base leading-7 max-w-lg">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type...
        </p>

        {/* Background Image Rectangle */}
        <div className="relative mt-10">
          <div className="w-full h-40 md:h-64 bg-transparent-300 rounded-2xl rounded-[16px]  overflow-hidden">
            <img src="./Service.png" alt="Journey" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Right Side: Services List */}
      <div className="md:w-1/3 flex flex-col gap-6">
        {services.map((service, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-indigo-800 rounded-full text-white">
              {service.icon}
            </div>
            <div className="flex flex-col">
              <h5 className="text-gray-800 font-baloo text-lg font-medium">{service.title}</h5>
              <p className="text-gray-500 text-sm">{service.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
    <section
      className="
        relative 
        bg-[#37377B] 
        rounded-[10px] 
        py-10 
        px-6 md:px-16 
        w-[80%] 
        mx-0
        mb-20 
        mt-0 
        overflow-hidden
        md:mx-[80px]
      "
      style={{ transform: "translateX(30px)" }} // shifts the right side slightly
    >
      <div className="flex flex-col md:flex-row justify-between items-center text-center gap-8 md:gap-0 text-white">

        {/* Card 1 */}
        <div>
          <h2 className="text-[#F8B528] font-baloo text-[60px] leading-[50px]">{value.Tourist_places}</h2>
          <p className="text-[20px] font-roboto mt-2">Tourist Places</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-[70px] bg-[#6F6FC1]"></div>

        {/* Card 2 */}
        <div>
          <h2 className="text-[#F8B528] font-baloo text-[60px] leading-[50px]">{value.Number_of_resorts}</h2>
          <p className="text-[20px] font-roboto mt-2">Number of Resorts</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-[70px] bg-[#6F6FC1]"></div>

        {/* Card 3 */}
        <div>
          <h2 className="text-[#F8B528] font-baloo text-[60px] leading-[50px]">{value.Happy_travellers}</h2>
          <p className="text-[20px] font-roboto mt-2">Happy Travelers</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-[70px] bg-[#6F6FC1]"></div>

        {/* Card 4 */}
        <div>
          <h2 className="text-[#F8B528] font-baloo text-[60px] leading-[50px]">{value.Fun_experiences}</h2>
          <p className="text-[20px] font-roboto mt-2">Fun Experiences</p>
        </div>
      </div>
    </section>
    </>
  );
};
