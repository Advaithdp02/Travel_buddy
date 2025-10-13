import React from 'react';
import { Header } from './Header';
import { AboutIcon1, AboutIcon2 } from './Icons';

export const AboutPage = ({ currentPage, navigate }) => {
  return (
    <>
      <Header currentPage={currentPage} navigate={navigate} />

      {/* Hero Section */}
      <section
        className="relative h-[40vh] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/about-hero/1600/900')" }}
      >
        <div className="absolute inset-0 bg-brand-dark/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold">About Us</h1>
          <p className="text-xl mt-4">Your trusted partner in crafting unforgettable travel experiences.</p>
        </div>
      </section>

      {/* About Us Section Content */}
      <section className="bg-brand-dark text-white py-20 px-8">
        <div className="container mx-auto grid md:grid-cols-2 items-center gap-12">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 border-2 border-brand-yellow rounded-lg opacity-50 hidden sm:block"></div>
            <img
              src="https://i.imgur.com/g0P0wQN.png"
              alt="Man with luggage giving thumbs up"
              className="relative z-10 rounded-lg"
            />
          </div>
          <div>
            <p className="text-brand-yellow font-semibold text-lg">About RE&LE</p>
            <h2 className="text-4xl font-bold my-4">Committed to Your Travel Adventure Experience</h2>
            <p className="text-gray-300 mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
              the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has survived not only five centuries, but
              also the leap into electronic typesetting, remaining essentially unchanged.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 mb-8">
              <div className="flex items-start space-x-4">
                <AboutIcon1 className="text-brand-yellow mt-1"/>
                <div>
                  <p className="font-semibold">Lorem Ipsum</p>
                  <p className="text-gray-400 text-sm">Lorem Ipsum is simply dummy text of the printing and typesetting</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <AboutIcon2 className="text-brand-yellow mt-1"/>
                <div>
                  <p className="font-semibold">Lorem Ipsum</p>
                  <p className="text-gray-400 text-sm">Lorem Ipsum is simply dummy text of the printing and typesetting</p>
                </div>
              </div>
            </div>
            <button className="bg-brand-yellow text-brand-dark font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">
              EXPLORE NOW
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white text-brand-dark py-16">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-8">
          <div>
            <p className="text-5xl font-bold text-brand-yellow">8745</p>
            <p className="text-brand-gray mt-2">Tourist Places</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-brand-yellow">9874</p>
            <p className="text-brand-gray mt-2">Number Of Resort</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-brand-yellow">9874</p>
            <p className="text-brand-gray mt-2">Happy Travelers</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-brand-yellow">6847</p>
            <p className="text-brand-gray mt-2">Tourist Places</p>
          </div>
        </div>
      </section>
    </>
  );
};
