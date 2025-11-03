import React, { useEffect, useState } from "react";
import { LocationProfileIcon, PhoneIcon, MailIcon, GenderIcon, DobIcon, JobIcon, HeartIcon } from "./Icons";
import axios from "axios";
import { AddContributionModal } from "./AddContributionModal";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [contribSubTab, setContribSubTab] = useState("all");
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [wishlist,setWishlist]=useState([]);

  const navigate=useNavigate()
  const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("Token:", token);
  if (!token) {
    console.warn("User not logged in");
    return;
  }

  const fetchUser = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetch response status:", res.status); // see status

      const data = await res.json();
      console.log("Fetched user JSON:", data); // see JSON

      const user = data.user ?? data; // normalize
      

      const initialForm = {
        name: user.name ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
        gender: user.gender ?? "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        job: user.occupation ?? user.job ?? "",
        relationship: user.relationshipStatus ?? "",
        location: user.location ?? "",
        profileImage: user.profilePic ?? "", // fallback if missing
        coverImage: user.coverPhoto ?? "",
      };
      setFollowers(user.followers || []);
      setFollowing(user.following || [])
      setWishlist(user.wishlist ||[]);
      
      setUserData(user);
      setFormData(initialForm);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };
  

  fetchUser();
}, []);

const removeFromWishlist = async (locationId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first");

    const res = await axios.put(
      `${BACKEND_URL}/users/wishlist/remove/${locationId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(res.data.message);
    setWishlist(res.data.wishlist);
    console.log("Updated wishlist:", res.data.wishlist);
  } catch (err) {
    console.error("Error removing:", err.response?.data || err.message);
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
const [userContributions, setUserContributions] = useState([]);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const fetchContributions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/contributions/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserContributions(data.contributions || data || []);
    } catch (err) {
      console.error("Failed to fetch contributions:", err);
    }
  };

  fetchContributions();
}, []);

const handleSave = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Not authenticated");
    return;
  }

  const payload = {
    name: formData.name,
    username: formData.username,
    bio: formData.bio,
    gender: formData.gender,
    dob: formData.dob ? new Date(formData.dob).toISOString() : undefined,
    phone: formData.phone,
    email: formData.email,
    occupation: formData.job,
    relationshipStatus: formData.relationship,
    location: formData.location, // use as-is
    profilePic: formData.profileImage,
    coverPhoto: formData.coverImage,
  };

  // Remove undefined fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  try {
    const res = await fetch(`${BACKEND_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update profile");
    }

    const data = await res.json();
    const updatedUser = data.user ?? data;

    setUserData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("userId", updatedUser._id ?? updatedUser.id ?? localStorage.getItem("userId"));

    setIsModalOpen(false);
    alert("Profile updated successfully");
  } catch (err) {
    console.error("Error updating profile:", err);
    alert(err.message || "Error updating profile");
  }
};

if (!userData) return <p className="text-center mt-20">Loading profile...</p>;


 return (
  <>
    <div className="min-h-screen bg-gray-100 py-6 px-2 sm:px-8 md:px-16 lg:px-24">
      {/* Cover Image */}
      <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gray-300 rounded-bl-lg rounded-br-lg overflow-hidden">
          <img
            src={userData?.coverImage || "/defaultCoverPic.png"}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="relative -mt-12 md:-mt-16 flex flex-col md:flex-col items-start space-x-0 md:space-x-6">
          <div className="flex-shrink-0 ml-4 md:ml-10 -mt-6 md:mt-0">
            <img
              src={userData?.profileImage || "/defaultProfilePic.webp"}
              alt="profile"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>

          <div className="flex flex-col md:flex-row ml-4 md:ml-10 mt-4 justify-between md:px-4 w-full">
            <div className="flex flex-col justify-center mb-3 md:mb-5">
              <h1 className="text-2xl md:text-3xl font-bold">{userData.name}</h1>
              <p className="text-gray-500">@{userData.username}</p>
              <p className="mt-1 text-gray-600 text-sm md:text-base">
                {userData.bio || "Traveler, Photographer, Coffee Lover"}
              </p>
            </div>

            <div className="flex md:flex-col gap-2 md:gap-4 mr-[20px]">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white font-semibold py-2 px-3 md:px-4 rounded-lg text-sm md:text-base"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white font-semibold py-2 px-3 md:px-4 rounded-lg text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full pt-4 md:pt-5 -mt-4 md:mt-0">
        {/* About Section */}
        <div className="col-span-1 flex flex-col gap-4 order-2 md:order-1">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">About</h3>
            <div className="space-y-2 md:space-y-3 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <GenderIcon className="w-5 h-5 text-gray-600" />
                <span>{userData.gender || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DobIcon className="w-5 h-5 text-gray-600" />
                <span>{userData.dob ? new Date(userData.dob).toLocaleDateString("en-GB") : "Not provided"}</span>
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
                <LocationProfileIcon className="w-5 h-5 text-gray-600" />
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
        <div className="col-span-2 order-1 md:order-2 flex flex-col gap-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden pt-3 md:pt-4 pb-4">
            <div className="flex border-b overflow-x-auto no-scrollbar">
              {["followers", "following", "contribution", "wishlist"].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 text-center py-2 md:py-3 font-semibold transition-transform duration-150 whitespace-nowrap ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600 -translate-y-[1px]"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-4 md:mt-6 px-3 md:px-6">
              {/* Tab Content (same as your original) */}
              {activeTab === "wishlist" && (
                <div className="mt-3 md:mt-4">
                  {wishlist.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white shadow-md rounded-xl p-3 flex items-center justify-between hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                            />
                            <div className="flex flex-col">
                              <p className="font-medium text-gray-800 text-sm md:text-base">{item.name}</p>
                              <p className="font-medium text-gray-800 text-xs md:text-sm">{item.district.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromWishlist(item._id)}
                            className="text-red-500 hover:text-red-600 text-sm font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6 md:py-10">Your wishlist is empty.</p>
                  )}
                </div>
              )}

              {/* followers, following, contribution — unchanged */}
              {activeTab === "followers" && (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
    {followers.length ? (
      followers.map((f) => (
        <div
          key={f._id}
          className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={(e) => {
            if (e.target.tagName !== "BUTTON") {
              navigate(`/profile/${f.username}`);
            }
          }}
        >
          <div className="flex items-center gap-4">
            <img
              src={f.profilePic || "/defaultProfilePic.webp"}
              alt={f.username}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <p className="font-semibold text-gray-800">{f.username}</p>
            </div>
          </div>

          
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center col-span-full mt-4">No followers yet</p>
    )}
  </div>
)}

{/* Following Tab */}
{activeTab === "following" && (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
    {following.length ? (
      following.map((f) => (
        <div
          key={f._id}
          className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={(e) => {
            if (e.target.tagName !== "BUTTON") {
              navigate(`/profile/${f.username}`);
            }
          }}
        >
          <div className="flex items-center gap-4">
            <img
              src={f.profilePic || "`https://i.pravatar.cc/50`"}
              alt={f.username}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <p className="font-semibold text-gray-800">{f.username}</p>
            </div>
          </div>

          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(
                  `${BACKEND_URL}/users/${f.username}/toggle-follow`,
                  {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (!res.ok) throw new Error("Failed to unfollow");

                setFollowing((prev) => prev.filter((u) => u._id !== f._id));
              } catch (err) {
                console.error(err);
                alert("Error unfollowing user");
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Unfollow
          </button>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center col-span-full mt-4">Not following anyone yet</p>
    )}
  </div>
)}

                {activeTab === "contribution" && (
  <div>
    <button
      className="w-full bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center mb-4 hover:bg-yellow-500"
      onClick={() => setIsAddContributionOpen(true)}
    >
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

    {/* Filtered Contributions */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {userContributions
        .filter((c) => {
          if (contribSubTab === "all") return true;
          if (contribSubTab === "approved") return c.verified;
          if (contribSubTab === "pending") return !c.verified;
        })
        .map((c) => (
          <div
            key={c._id}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer border-t-4 ${
              c.verified ? "border-green-500" : "border-yellow-500"
            }`}
          >
            <img
              src={c.coverImage || "/defaultCoverPic.png"}
              alt={c.description || "Contribution"}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h4 className="font-bold">{c.location?.name || "Unknown Location"}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
            <p
              className={`mt-1 text-xs font-semibold ${
                c.verified ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {c.verified ? "✅ Approved" : "🕒 Pending"}
            </p>
          </div>
        ))}
    </div>
  </div>
)}
              {/* keep same structure as your original for these sections */}
            </div>
          </div>
        </div>
      </div>

      {/* Modals unchanged */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] md:w-full max-w-lg rounded-lg shadow-lg p-4 md:p-6 relative">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Edit Profile</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              ×
            </button>

            {/* form fields same as before */}
          </div>
        </div>
      )}

      <AddContributionModal
        isOpen={isAddContributionOpen}
        onClose={() => setIsAddContributionOpen(false)}
        onSave={(contributionData) => handleSaveContribution(contributionData)}
        locationId={location._id}
      />
    </div>
  </>
);
};