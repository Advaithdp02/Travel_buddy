import React, { useState } from "react";
import { LocationIcon, PhoneIcon, MailIcon, GenderIcon, DobIcon, JobIcon, HeartIcon } from "./Icons";
import { Header } from "./Header";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [contribSubTab, setContribSubTab] = useState("all");

  return (
    <>
      <Header variant="light" />
      <div className="min-h-screen bg-gray-100 mt-20 py-6 px-4 sm:px-8 md:px-16 lg:px-24">
        {/* Cover Image */}
        <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
        <div className="relative h-64 bg-gray-300 rounded-bl-lg rounded-br-lg overflow-hidden">
          <img
            src="https://picsum.photos/1200/400"
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile info: flex layout */}
        <div className="relative -mt-16 flex-col items-start space-x-6">
          {/* Profile Pic */}
          <div className="flex-shrink-0 ml-10">
            <img
              src="https://i.pravatar.cc/150"
              alt="profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>

          {/* Name / Username / Bio */}
          <div className="flex flex-col justify-center mb-5">
            <h1 className="text-3xl font-bold">John Doe</h1>
            <p className="text-gray-500">@john_doe</p>
            <p className="mt-1 text-gray-600">Traveler, Photographer, Coffee Lover</p>
          </div>
     </div>
    </div>
    <div className="grid grid-cols-3 gap-8 w-full pt-5">
  {/* About Section */}
  <div className="col-span-1 flex flex-col gap-4">
    <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden p-6">
      <h3 className="text-2xl font-bold mb-4">About</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <GenderIcon className="w-5 h-5 text-gray-600" />
          <span>Male</span>
        </div>
        <div className="flex items-center space-x-2">
          <DobIcon className="w-5 h-5 text-gray-600" />
          <span>01 Jan 1990</span>
        </div>
        <div className="flex items-center space-x-2">
          <PhoneIcon className="w-5 h-5 text-gray-600" />
          <span>+1 234 567 890</span>
        </div>
        <div className="flex items-center space-x-2">
          <MailIcon className="w-5 h-5 text-gray-600" />
          <span>john@example.com</span>
        </div>
        <div className="flex items-center space-x-2">
          <LocationIcon className="w-5 h-5 text-gray-600" />
          <span>New York, USA</span>
        </div>
        <div className="flex items-center space-x-2">
          <JobIcon className="w-5 h-5 text-gray-600" />
          <span>Software Engineer</span>
        </div>
        <div className="flex items-center space-x-2">
          <HeartIcon className="w-5 h-5 text-gray-600" />
          <span>Single</span>
        </div>
      </div>
    </div>
  </div>

  {/* Tabs & Content Section */}
  <div className="col-span-2 flex flex-col gap-4">
    <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden pt-4">
      {/* Main Tabs */}
      <div className="flex border-b">
        {["followers", "following", "contribution", "wishlist"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 text-center py-3 font-semibold transition-transform duration-150 ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 -translate-y-1"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-6 px-6">
        {["followers", "following", "wishlist"].includes(activeTab) && (
          <div className="text-center text-gray-600 py-10">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} page content here...
          </div>
        )}

        {activeTab === "contribution" && (
          <div>
            {/* Add New Place */}
            <button className="w-full bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center mb-4 hover:bg-yellow-500">
              <span className="mr-2">+</span> Add New Place
            </button>

            {/* Sub Tabs */}
            <div className="flex space-x-4 mb-4">
              {["all", "approved", "pending"].map((sub) => (
                <button
                  key={sub}
                  className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
                    contribSubTab === sub
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  onClick={() => setContribSubTab(sub)}
                >
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </button>
              ))}
            </div>

            <div className="text-gray-600">
              Showing {contribSubTab} contributions here...
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>




      </div>
    </>
  );
};
