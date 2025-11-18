import React from "react";
import {ClimateIcon,LocationIcon,PlacesIcon,HotelsIcon,TrafficIcon} from "./Icons";


export const Service = () => {
  const services = [
{
  icon: <ClimateIcon />,
  title: "Climate",
  subtitle: "Get insights on seasonal weather patterns and temperature trends."
},
{
  icon: <LocationIcon />,
  title: "Location",
  subtitle: "Understand the area's position, connectivity, and nearby essentials."
},
{
  icon: <PlacesIcon />,
  title: "Places",
  subtitle: "Explore popular attractions, landmarks, and points of interest."
},
{
  icon: <HotelsIcon />,
  title: "Hotels",
  subtitle: "Discover nearby stays with the best comfort, pricing, and amenities."
},
{
  icon: <TrafficIcon />,
  title: "Traffic",
  subtitle: "Check real-time traffic flow, commute times, and road conditions."
}

  ];
  const value={
    Happy_travellers:9867,
    Tourist_places:8567,
    Number_of_resorts:9684,
    Fun_experiences:6874
  }

  return (
    <>    <section id="services" className="relative bg-[#fbebff] w-full flex flex-col md:flex-row items-start bg-white py-20 gap-10 px-6 md:px-20">
      
      {/* Left Content */}
      <div className="md:w-2/3 relative flex flex-col gap-6">
        {/* Our Services title */}
        <h4 className="text-[#9156F1] font-schoolbell text-3xl">Our Services</h4>
        
        {/* Main Heading */}
        <h2 className="text-[#310a49] font-poppins text-4xl md:text-5xl font-medium leading-snug">
          Your Gateway to Unforgettable Journeys
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm md:text-base leading-7 max-w-lg">
          We cover all locations, ensuring you have a smooth and enjoyable journey. No matter where you go, TravelBuddy is always by your side, helping you travel smart and stress-free. Let us guide you to the best experiences, making every trip memorable!
          <br/>"Traveling is a lifelong evolution, where every journey shapes a new version of ourselves."  </p>

        {/* Background Image Rectangle */}
        <div className="relative mt-10">
          <div className="w-[90%] h-40 md:h-64 bg-transparent-300 rounded-2xl rounded-[16px]  overflow-hidden">
            <img src="./Service.png" alt="Journey" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Right Side: Services List */}
      <div className="md:w-1/3 flex flex-col gap-6">
        {services.map((service, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-[#310a49] rounded-full text-white">
              {service.icon}
            </div>
            <div className="flex flex-col">
              <h5 className="text-gray-800 font-poppins text-lg font-medium">{service.title}</h5>
              <p className="text-gray-500 text-sm">{service.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
    <section
      className="
        relative 
        bg-gradient-to-r from-[#591DA9]  to-[#CB98ED]
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
          <h2 className="text-whotefont-poppins text-[60px] leading-[50px]">{value.Tourist_places}</h2>
          <p className="text-[20px] font-poppins mt-2">Tourist Places</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-[70px] bg-[#6F6FC1]"></div>

        {/* Card 2 */}
        <div>
          <h2 className="text-whotefont-poppins text-[60px] leading-[50px]">{value.Number_of_resorts}</h2>
          <p className="text-[20px] font-poppins mt-2">Number of Resorts</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-[70px] bg-[#6F6FC1]"></div>

        {/* Card 3 */}
        <div>
          <h2 className="text-whotefont-poppins text-[60px] leading-[50px]">{value.Happy_travellers}</h2>
          <p className="text-[20px] font-poppins mt-2">Happy Travelers</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-[70px] bg-[#6F6FC1]"></div>

        {/* Card 4 */}
        <div>
          <h2 className="text-whotefont-poppins text-[60px] leading-[50px]">{value.Fun_experiences}</h2>
          <p className="text-[20px] font-poppins mt-2">Fun Experiences</p>
        </div>
      </div>
    </section>
    </>
  );
};
