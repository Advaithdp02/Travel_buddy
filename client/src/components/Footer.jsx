import React from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from './Icons';

export const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: About */}
          <div>
            <h2 className="text-3xl font-bold mb-4">RE&LE</h2>
            <p className="text-gray-400 mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-colors"><FacebookIcon /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-colors"><TwitterIcon /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-colors"><InstagramIcon /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-yellow hover:text-brand-dark transition-colors"><LinkedinIcon /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-brand-yellow">Home</a></li>
              <li><a href="#" className="hover:text-brand-yellow">About US</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Services</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Blog</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Terms and Conditions</a></li>
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-brand-yellow">Home</a></li>
              <li><a href="#" className="hover:text-brand-yellow">About US</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Services</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Blog</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-yellow">Terms and Conditions</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-gray-400">
              <li>No 234, Placer Loquen Marsei Niriva, Moliva.</li>
              <li>+33 321-654-987 (Ext: 123)</li>
              <li>booking@example.com</li>
              <li>www.example.com</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2024 Re&Le Travel Buddy. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-brand-yellow">Privacy Policy</a>
            <a href="#" className="hover:text-brand-yellow">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
