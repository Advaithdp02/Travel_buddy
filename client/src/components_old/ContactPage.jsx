import React from 'react';
import { Header } from './Header';
import { UserIcon, EmailIcon, SubjectIcon } from './Icons';

export const ContactPage = ({ currentPage, navigate }) => {
  return (
    <>
      <Header currentPage={currentPage} navigate={navigate} />

      {/* Hero Section */}
      <section
        className="relative h-[40vh] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/contact-hero/1600/900')" }}
      >
        <div className="absolute inset-0 bg-brand-dark/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold">Contact Us</h1>
          <p className="text-xl mt-4">We're here to help. Get in touch with our team.</p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-brand-light-purple p-8 rounded-xl">
              <h2 className="text-3xl font-bold text-brand-dark mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="relative">
                  <label htmlFor="name" className="sr-only">Name</label>
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" />
                  <input
                    type="text"
                    id="name"
                    placeholder="Your Name"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <EmailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" />
                  <input
                    type="email"
                    id="email"
                    placeholder="Your Email"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="subject" className="sr-only">Subject</label>
                  <SubjectIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" />
                  <input
                    type="text"
                    id="subject"
                    placeholder="Subject"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea
                    id="message"
                    placeholder="Your Message"
                    rows={5}
                    className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105"
                  >
                    SEND MESSAGE
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info and Map */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-brand-dark mb-6">Contact Information</h2>
                <div className="space-y-4 text-brand-gray">
                  <p><strong>Address:</strong> No 234, Placer Loquen Marsei Niriva, Moliva.</p>
                  <p><strong>Phone:</strong> +33 321-654-987 (Ext: 123)</p>
                  <p><strong>Email:</strong> booking@example.com</p>
                  <p><strong>Website:</strong> www.example.com</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-lg h-80">
                <img src="https://i.imgur.com/k2e4b4C.png" alt="Map" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
