import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from './Icons';

export const Footer = () => {
  return (
    <footer className="bg-[#1A093F] text-white font-['Baloo_2'] relative">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 sm:px-8 py-12 sm:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 relative text-center sm:text-left">
          
          {/* Column 1: Logo + About + Follow Us */}
          <div className="relative z-10 flex flex-col items-center sm:items-start">
            <img src="./FooterLogo.png" alt="Moliva Logo" className="mb-4 w-9 sm:w-32" />
            <p className="text-gray-400 mb-6 text-sm leading-6 max-w-xs sm:max-w-none">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <h4 className="text-white text-lg font-semibold mb-2">Follow Us</h4>

            {/* Social Icons */}
            <div className="flex justify-center sm:justify-start space-x-4">
              <a href="#" className="p-2 bg-[#F2B024] rounded-full hover:bg-white/10 transition-colors"><FacebookIcon /></a>
              <a href="#" className="p-2 bg-[#F2B024] rounded-full hover:bg-white/10 transition-colors"><TwitterIcon /></a>
              <a href="#" className="p-2 bg-[#F2B024] rounded-full hover:bg-white/10 transition-colors"><InstagramIcon /></a>
              <a href="#" className="p-2 bg-[#F2B024] rounded-full hover:bg-white/10 transition-colors"><LinkedinIcon /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm list-disc pl-5">
              {["Home", "About Us", "Services", "Blog", "Contact Us", "Terms & Conditions"].map((link, i) => (
                <li key={i} className="marker:text-[#F2B024] hover:text-[#F2B024] cursor-pointer">{link}</li>
              ))}
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-gray-400 text-sm list-disc pl-5">
              {["Destinations", "Tours", "Offers", "Gallery", "Contact", "Help"].map((link, i) => (
                <li key={i} className="marker:text-[#F2B024] hover:text-[#F2B024] cursor-pointer">{link}</li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="relative z-10 flex flex-col items-center sm:items-start">
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-gray-400 text-sm list-none">
              <li>No 234, Placer Loquen Marsei Niriva, Moliva.</li>
              <li>+33 321-654-987 (Ext: 123)</li>
              <li>booking@example.com</li>
              <li>www.example.com</li>
            </ul>
          </div>

          {/* Vertical Lines Between Columns (hide on mobile) */}
          <hr className="hidden lg:block absolute top-0 left-[25%] h-44 border-l border-white/20" />
          <hr className="hidden lg:block absolute top-0 left-[50%] h-44 border-l border-white/20" />
          <hr className="hidden lg:block absolute top-0 left-[75%] h-44 border-l border-white/20" />
        </div>
      </div>

      {/* Horizontal HR Line */}
      <hr className="border-t border-white/20 mx-6 sm:mx-8" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-white text-center sm:text-left">
        <p className="mb-3 sm:mb-0">&copy; 2024 Moliva Travel Agency. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-[#F2B024]">Privacy Policy</a>
          <a href="#" className="hover:text-[#F2B024]">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
};
