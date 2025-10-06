import React, { useEffect, useState } from "react";
import { LocationIcon, PhoneIcon, MailIcon, GenderIcon, DobIcon, JobIcon, HeartIcon } from "./Icons";
import { Header } from "./Header";
import { Link, useParams } from "react-router-dom";

export const ProfilePublic = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const logout = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  // Fetch profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/profile/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data);
        console.log(data);

        const currentUserId = JSON.parse(atob(token.split(".")[1])).id;
        setIsFollowing(data.followers.some(f => f._id === currentUserId));
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  // Toggle Follow
  const handleToggleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/follow/${username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to toggle follow");
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading profile...</div>;
  }

  if (error || !user) {
    return (
      <>
        <Header variant="light" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">User not found</h1>
            <p className="text-gray-600 mt-2">The username @{username} does not exist.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="light" />
      <div className="min-h-screen bg-gray-100 mt-20 py-6 px-4 sm:px-8 md:px-16 lg:px-24">
        {/* Cover Image */}
        <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
          <div className="relative h-64 bg-gray-300 rounded-bl-lg rounded-br-lg overflow-hidden">
            <img src="https://picsum.photos/1200/400" alt="cover" className="w-full h-full object-cover" />
          </div>

          {/* Profile info */}
          <div className="relative -mt-16 flex-col items-start space-x-6">
            <div className="flex-shrink-0 ml-10">
              <img
                src={user.profilePic || "https://i.pravatar.cc/150"}
                alt="profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>
            <div className="flex flex-row ml-10 mt-4 justify-between px-4 w-full">
              <div className="flex flex-col justify-center mb-5">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-500">@{user.username}</p>
                <p className="mt-1 text-gray-600">{user.bio}</p>
              </div>
              <div className="flex flex-col gap-4 px-10">
                <button
                  onClick={handleToggleFollow}
                  className={`${
                    isFollowing ? "bg-gray-400" : "bg-blue-600"
                  } text-white font-semibold py-2 px-4 rounded-lg`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-8 w-full pt-5">
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden p-6">
              <h3 className="text-2xl font-bold mb-4">About</h3>
              {/* Replace with real user data */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <GenderIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.gender || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DobIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.dob ? new Date(user.dob).toLocaleDateString("en-GB") : "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MailIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.email || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LocationIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.location || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <JobIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.job || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                  <span>{user.status || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden pt-4">
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
                {["followers", "following", "contribution", "wishlist"].includes(activeTab) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-10">
                        {(user[activeTab]?.length ?? 0) === 0 ? (
                          <p className="text-gray-500 col-span-full text-center py-10">
                            No {activeTab} yet.
                          </p>
                        ) : (
                          user[activeTab]?.map((u) => (
                            <Link to={`/profile/${u.username}`} key={u._id}>
                              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg shadow-sm">
                                <img
                                  src={u.profilePic || "https://i.pravatar.cc/40"}
                                  alt={u.username}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-semibold text-gray-700">@{u.username}</span>
                              </div>
                            </Link>
                          ))
                        )}
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
