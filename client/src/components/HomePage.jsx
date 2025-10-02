import React from 'react';
import { Header } from './Header';
import { LocationIcon, HotelIcon, RestaurantIcon, LeftArrowIcon, RightArrowIcon, ClimateIcon, PlacesIcon, TrafficIcon } from './Icons';

export const HomePage = ({ currentPage, navigate }) => {
  const topDestinations = [
    { name: 'Kozhikode', img: 'https://picsum.photos/300/400?random=1' },
    { name: 'Alappuzha', img: 'https://picsum.photos/300/400?random=2' },
    { name: 'Palakkad', img: 'https://picsum.photos/300/400?random=3' },
    { name: 'Wayanad', img: 'https://picsum.photos/300/400?random=4' },
  ];
  
  const services = [
    { name: 'Climate', icon: <ClimateIcon />, description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's" },
    { name: 'Location', icon: <LocationIcon className="w-8 h-8 text-brand-dark" />, description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's" },
    { name: 'Places', icon: <PlacesIcon />, description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's" },
    { name: 'Hotels', icon: <HotelIcon className="w-8 h-8 text-brand-dark" />, description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's" },
    { name: 'Traffic', icon: <TrafficIcon />, description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white pt-32 pb-16 overflow-hidden">
        <Header currentPage={currentPage} navigate={navigate} />
        <div className="container mx-auto px-8 grid md:grid-cols-2 items-center gap-8">
          <div className="z-10">
            <p className="text-brand-yellow font-semibold text-lg">Explore the world</p>
            <h1 className="text-5xl md:text-7xl font-bold text-brand-dark my-4 leading-tight">It's Time to Travel Around the World</h1>
            <p className="text-brand-gray mb-8">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            <button className="bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105">EXPLORE NOW</button>
          </div>
          <div className="relative">
            <img src="https://i.imgur.com/kS5B4i2.png" alt="Happy couple ready to travel" className="relative z-10 max-w-full mx-auto" style={{ maxWidth: '550px' }} />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 items-start gap-16">
            <div className="order-2 md:order-1">
              <p className="text-brand-yellow font-semibold text-lg">Our Services</p>
              <h2 className="text-4xl font-bold text-brand-dark my-2">Your Gateway to Unforgettable Journeys</h2>
              <p className="text-brand-gray mb-8">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text since the 1500s...</p>
              <img src="https://picsum.photos/seed/service/600/400" alt="Scenic view" className="rounded-lg shadow-xl w-full" />
            </div>
            <div className="order-1 md:order-2 grid grid-cols-1 gap-8">
              {services.map(service => (
                <div key={service.name} className="flex items-start space-x-4">
                   <div className="flex-shrink-0 w-12 h-12 bg-brand-light-purple rounded-full flex items-center justify-center">
                      {service.icon}
                   </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark mb-2">{service.name}</h3>
                    <p className="text-brand-gray">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-8">
          <div>
            <p className="text-5xl font-bold text-brand-yellow">8745</p>
            <p className="text-gray-300 mt-2">Tourist Places</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-brand-yellow">9874</p>
            <p className="text-gray-300 mt-2">Number Of Resorts</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-brand-yellow">9874</p>
            <p className="text-gray-300 mt-2">Happy Travelers</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-brand-yellow">6847</p>
            <p className="text-gray-300 mt-2">Tourist Places</p>
          </div>
        </div>
      </section>

      {/* Top Destination Section */}
      <section className="bg-brand-light-purple py-20 px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <p className="text-brand-yellow font-semibold text-lg">Top Destination</p>
              <h2 className="text-4xl font-bold text-brand-dark">Explore Top Destinations</h2>
            </div>
            <div className="flex space-x-4">
              <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100"><LeftArrowIcon /></button>
              <button className="p-3 bg-brand-yellow rounded-full shadow-md hover:bg-yellow-400"><RightArrowIcon /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topDestinations.map(dest => (
              <div key={dest.name} className="bg-white rounded-2xl shadow-lg overflow-hidden p-4">
                <img src={dest.img} alt={dest.name} className="w-full h-64 object-cover rounded-xl mb-4" />
                <h3 className="text-xl font-bold text-brand-dark">{dest.name}</h3>
                <p className="text-brand-gray text-sm mb-4">Enjoy The Beauty Of {dest.name}</p>
                <div className="flex justify-between items-center text-sm text-brand-gray border-t border-b py-2 my-2">
                  <span className="flex items-center"><LocationIcon /> 150+</span>
                  <span className="flex items-center"><HotelIcon /> 150+</span>
                  <span className="flex items-center"><RestaurantIcon /> 150+</span>
                </div>
                <button className="w-full bg-brand-dark text-white font-semibold py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors">LETS GO</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
