import React from "react";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
} from "./Icons";

export const Footer = () => {
  return (
    <footer className="bg-[#D4A3E2] text-white font-poppins relative">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 sm:px-8 py-12 sm:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 relative text-center sm:text-left">
          
          {/* Column 1: Logo + About + Follow Us */}
          <div className="relative z-10 flex flex-col items-center sm:items-start">
            <div className="text-[#310a49] mb-6 text-sm leading-6 max-w-xs sm:max-w-none">
              <div className="w-full flex justify-center">
                <img
                  src="./FooterLogo.png"
                  alt="Moliva Logo"
                  className="w-[10.25rem] sm:w-32"
                />
              </div>
              <p>
                Travel Buddy - here to help you create amazing experiences and
                make the most of every moment.
              </p>
            </div>

            <h4 className="text-white text-lg font-semibold mb-2">Follow Us</h4>

            {/* Social Icons */}
            <div className="flex justify-center sm:justify-start space-x-4">
              <a
                href="https://www.facebook.com/p/ReLe-travelbuddy-61566805060226/"
                className="p-2 bg-[#310a49] rounded-full hover:bg-white/10 transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                className="p-2 bg-[#310a49] rounded-full hover:bg-white/10 transition-colors"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://www.instagram.com/reandletravelbuddy/?hl=en"
                className="p-2 bg-[#310a49] rounded-full hover:bg-white/10 transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/reandle-travelbuddy/"
                className="p-2 bg-[#310a49] rounded-full hover:bg-white/10 transition-colors"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-[#310a49] text-sm list-disc pl-5">
              {[
                "Home",
                "About Us",
                "Services",
                "Blog",
                "Contact Us",
                "Terms & Conditions",
              ].map((link, i) => (
                <li
                  key={i}
                  className="marker:text-white hover:text-white cursor-pointer"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-[#310a49] text-sm list-disc pl-5">
              {[
                "Destinations",
                "Tours",
                "Offers",
                "Gallery",
                "Contact",
                "Help",
              ].map((link, i) => (
                <li
                  key={i}
                  className="marker:text-white hover:text-white cursor-pointer"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="relative z-10 flex flex-col items-center sm:items-start">
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-[#310a49] text-sm list-none">
              <li>No 234, Placer Loquen Marsei Niriva, Moliva.</li>
              <li>+33 321-654-987 (Ext: 123)</li>
              <li>booking@example.com</li>
              <li>www.example.com</li>
            </ul>
          </div>

          {/* Vertical Lines Between Columns */}
          <hr className="hidden lg:block absolute top-0 left-[25%] h-44 border-l border-[#310a49]" />
          <hr className="hidden lg:block absolute top-0 left-[50%] h-44 border-l border-[#310a49]" />
          <hr className="hidden lg:block absolute top-0 left-[75%] h-44 border-l border-[#310a49]" />
        </div>
      </div>

      {/* Horizontal HR Line */}
      <hr className="border-t border-[#310a49] mx-6 sm:mx-8" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-white text-center sm:text-left">
        <p className="mb-3 sm:mb-0">
          &copy; 2024 Travel Buddy. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
};
