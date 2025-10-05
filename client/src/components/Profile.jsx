import React, { useEffect, useState } from "react";
import { LocationIcon, PhoneIcon, MailIcon, GenderIcon, DobIcon, JobIcon, HeartIcon } from "./Icons";
import { Header } from "./Header";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [contribSubTab, setContribSubTab] = useState("all");
  const [userData, setUserData] = useState(null);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("User not logged in");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  if (!userData) return <p className="text-center mt-20">Loading profile...</p>;

  return (
    <>
      <Header variant="light" />
      <div className="min-h-screen bg-gray-100 mt-20 py-6 px-4 sm:px-8 md:px-16 lg:px-24">
        {/* Cover Image */}
        <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
          <div className="relative h-64 bg-gray-300 rounded-bl-lg rounded-br-lg overflow-hidden">
            <img
              src={userData.coverImage || "https://picsum.photos/1200/400"}
              alt="cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile info */}
          <div className="relative -mt-16 flex-col items-start space-x-6">
            <div className="flex-shrink-0 ml-10">
              <img
                src={userData.profileImage || "https://i.pravatar.cc/150"}
                alt="profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>
            <div className="flex flex-row ml-10 mt-4 justify-between px-4 ">
              <div className="flex flex-col justify-center mb-5">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <p className="text-gray-500">@{userData.username}</p>
                <p className="mt-1 text-gray-600">{userData.bio || "Traveler, Photographer, Coffee Lover"}</p>
              </div>
              <div className="flex flex-col gap-4">
                <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Edit Profile</button>
                <button onClick={logout} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Logout</button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-8 w-full pt-5">
          {/* About Section */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden p-6">
              <h3 className="text-2xl font-bold mb-4">About</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <GenderIcon className="w-5 h-5 text-gray-600" />
                  <span>{userData.gender || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DobIcon className="w-5 h-5 text-gray-600" />
                  <span>
                      {userData.dob ? new Date(userData.dob).toLocaleDateString("en-GB") : "Not provided"}
                  </span>

                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-5 h-5 text-gray-600" />
                  <span>{userData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MailIcon className="w-5 h-5 text-gray-600" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LocationIcon className="w-5 h-5 text-gray-600" />
                  <span>{userData.location || "Not specified"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <JobIcon className="w-5 h-5 text-gray-600" />
                  <span>{userData.job || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                  <span>{userData.relationship || "Single"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden pt-4">
              <div className="flex border-b">
                {["followers", "following", "contribution", "wishlist"].map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 text-center py-3 font-semibold transition-transform duration-150 ${
                      activeTab === tab ? "border-b-2 border-blue-600 text-blue-600 -translate-y-1" : "text-gray-500"
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
                    <button className="w-full bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center mb-4 hover:bg-yellow-500">
                      <span className="mr-2">+</span> Add New Place
                    </button>
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
                    <div className="text-gray-600">Showing {contribSubTab} contributions here...</div>
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
