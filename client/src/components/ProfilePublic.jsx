import React, { useEffect, useState } from "react";
import {
  LocationProfileIcon,
  PhoneIcon,
  MailIcon,
  GenderIcon,
  DobIcon,
  JobIcon,
  HeartIcon,
} from "./Icons";
import { useParams, useNavigate } from "react-router-dom";

export const ProfilePublic = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("followers");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setCurrentUser(payload); 
     
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/users/profile/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data);

        // check following
        const currentUserId = JSON.parse(atob(token.split(".")[1])).id;
        setIsFollowing(data.followers.some((f) => f._id === currentUserId));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, isFollowing]);

  const handleToggleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/users/follow/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to follow/unfollow");
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading profile...</p>;

  if (error || !user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">User not found</h1>
          <p className="text-gray-600 mt-2">
            The username @{username} does not exist.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fbebff] py-6 px-4 sm:px-8 md:px-16 lg:px-24">
      {/* Cover Image */}
      <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gray-300">
          <img
            src={user.coverPhoto || "/defaultCoverPic.png" }
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="relative -mt-12 md:-mt-16 flex md:px-0 px-5 md:py-0 py-2 flex-col md:flex-col items-start space-x-0 md:space-x-6">
  <div className="flex-shrink-0 ml-4 md:ml-10 -mt-6 md:mt-0">
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
      <img
        src={user?.profilePic || "/defaultProfilePic.webp"}
        alt="profile"
        className="w-full h-full object-cover"
      />
    </div>
  </div>

          <div className="flex flex-col md:flex-row ml-6 md:ml-10 mt-4 justify-between md:px-4 w-full">
            <div className="flex flex-col justify-center mb-3 md:mb-5">
              <h1 className="text-2xl md:text-3xl text-[#310a49] font-bold">{user.name}</h1>
              <p className="text-[#9156F1]">@{user.username}</p>
              <p className="mt-1 text-gray-600 text-sm md:text-base">
                {user.bio || "No bio provided"}
              </p>
            </div>

            <div className="flex md:flex-col gap-2 md:gap-4 mr-[40px]">
             { user._id !== currentUser.id&& (
  <button
    onClick={handleToggleFollow}
    className={`${
      isFollowing ? "bg-[#310a49]" : "bg-[#9156F1]"
    } text-white font-semibold py-2 px-3 md:px-4 rounded-lg text-sm md:text-base`}
  >
    {isFollowing ? "Unfollow" : "Follow"}
  </button>
)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full pt-4 md:pt-5">
        {/* About Section */}
        <div className="col-span-1 text-[#310a49]  flex flex-col gap-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">About</h3>
            <div className="space-y-2 md:space-y-3 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <GenderIcon className="w-5 h-5 text-[#310a49]" />
                <span>{user.gender || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DobIcon className="w-5 h-5 text-[#310a49]" />
                <span>
                  {user.dob
                    ? new Date(user.dob).toLocaleDateString("en-GB")
                    : "Not provided"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-[#310a49]" />
                <span>{user.phone || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MailIcon className="w-5 h-5 text-[#310a49]" />
                <span>{user.email || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <LocationProfileIcon className="w-5 h-5 text-[#310a49]" />
                <span>{user.location || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <JobIcon className="w-5 h-5 text-[#310a49]" />
                <span>{user.occupation || user.job || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-5 h-5 text-[#310a49]" />
                <span>{user.relationshipStatus || "Single"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-[#310a49] shadow-lg rounded-lg overflow-hidden pt-3 md:pt-4 pb-4">
            {/* Tabs Header */}
            <div className="flex border-b overflow-x-auto no-scrollbar">
              {["followers", "following", "contribution"].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 text-center py-2 md:py-3 font-semibold transition-transform duration-150 whitespace-nowrap ${
                    activeTab === tab
                      ? "border-b-2 border-[#9156F1] text-white -translate-y-[1px]"
                      : "text-[#fbebff]/70"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4 md:mt-6 px-3 md:px-6">
              {activeTab === "followers" && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                  {user.followers?.length ? (
                    user.followers.map((f) => (
                      <div
                        key={f._id}
                        className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/profile/${f.username}`)}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={f.profilePic || "/defaultProfilePic.webp"}
                            alt={f.username}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {f.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center col-span-full mt-4">
                      No followers yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === "following" && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                  {user.following?.length ? (
                    user.following.map((f) => (
                      <div
                        key={f._id}
                        className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/profile/${f.username}`)}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={f.profilePic || "/defaultProfilePic.webp" }
                            alt={f.username}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {f.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center col-span-full mt-4">
                      Not following anyone yet
                    </p>
                  )}
                </div>
              )}

              {activeTab === "contribution" && (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {user.contributions?.length ? (
      user.contributions.map((c) => (
        <div
          key={c._id}
          className={`bg-white rounded-lg shadow p-4 border-t-4 ${
            c.verified ? "border-green-500" : "border-yellow-500"
          }`}
        >
          {/* Cover Image */}
          <img
            src={c.coverImage || "/defaultCoverPic.png"}
            alt={c.title || "Contribution"}
            className="w-full h-40 object-cover rounded mb-2"
          />

          {/* Title */}
          <h4 className="font-bold text-lg">
            {c.title || "Untitled Place"}
          </h4>

          {/* District */}
          <p className="text-sm text-gray-500 mb-1">
            {c.district || "Unknown District"}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {c.description}
          </p>

          {/* Status */}
          <p
            className={`mt-2 text-xs font-semibold ${
              c.verified ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {c.verified ? "✅ Approved" : "🕒 Pending Approval"}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center col-span-full py-10">
        No contributions yet.
      </p>
    )}
  </div>
)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
