import React, { useState } from "react";
import { LocationIcon, PhoneIcon, MailIcon, GenderIcon, DobIcon, JobIcon, HeartIcon } from "./Icons"; // Replace with your icons

export const Profile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [contribSubTab, setContribSubTab] = useState("all");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover Image */}
      <div className="relative h-64 bg-gray-300">
        <img
          src="https://picsum.photos/1200/400"
          alt="cover"
          className="w-full h-full object-cover"
        />
        {/* Profile Pic */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <img
            src="https://i.pravatar.cc/150"
            alt="profile"
            className="w-32 h-32 rounded-full border-4 border-white"
          />
        </div>
      </div>

      {/* Name / Username / Edit */}
      <div className="mt-20 text-center px-4">
        <div className="flex justify-center items-center space-x-4">
          <h1 className="text-3xl font-bold">John Doe</h1>
          <button className="ml-4 bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center">
            Edit Profile
          </button>
        </div>
        <p className="text-gray-500">@john_doe</p>
        <p className="mt-2 text-gray-600">Traveler, Photographer, Coffee Lover</p>
      </div>

      {/* Tabs: About / Followers / Following / Contribution / Wishlist */}
      <div className="mt-8 px-4">
        <div className="flex space-x-4 justify-center border-b">
          {["about", "followers", "following", "contribution", "wishlist"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 font-semibold ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              </div>
              <div className="space-y-2">
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
          )}

          {/* Followers / Following / Wishlist */}
          {["followers", "following", "wishlist"].includes(activeTab) && (
            <div className="text-center text-gray-600">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} page content here...
            </div>
          )}

          {/* Contribution Tab */}
          {activeTab === "contribution" && (
            <div>
              {/* Add New Place Button */}
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center mb-4 hover:bg-blue-700">
                <span className="mr-2">+</span> Add New Place
              </button>

              {/* Sub-tabs: All / Approved / Pending */}
              <div className="flex space-x-4 border-b mb-4">
                {["all", "approved", "pending"].map((sub) => (
                  <button
                    key={sub}
                    className={`py-2 px-4 font-semibold ${
                      contribSubTab === sub
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500"
                    }`}
                    onClick={() => setContribSubTab(sub)}
                  >
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sub-tab content */}
              <div className="text-gray-600">
                Showing {contribSubTab} contributions here...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
