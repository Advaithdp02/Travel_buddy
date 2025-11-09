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
  const [wishlist, setWishlist] = useState([]);

  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("User not logged in");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

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
          relationshipStatus: user.relationshipStatus ?? "",
          location: user.location ?? "",
          profileImage: user.profilePic ?? "", // fallback if missing
          coverImage: user.coverPhoto ?? "",
        };
        setFollowers(user.followers || []);
        setFollowing(user.following || []);
        setWishlist(user.wishlist || []);

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

      // Optimistically remove locally
      setWishlist((prev) => prev.filter((item) => item._id !== locationId));

      // Update backend
      await axios.put(
        `${BACKEND_URL}/users/wishlist/remove/${locationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error removing:", err.response?.data || err.message);
      alert("Failed to remove from wishlist");
      // Optionally: refetch wishlist from backend to restore state
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
    if (!token) return alert("Not authenticated");

    try {
      const form = new FormData();

      // Text fields
      form.append("name", formData.name || "");
      form.append("username", formData.username || "");
      form.append("bio", formData.bio || "");
      form.append("gender", formData.gender || "");
      form.append("dob", formData.dob || "");
      form.append("phone", formData.phone || "");
      form.append("email", formData.email || "");
      form.append("occupation", formData.job || "");
      form.append("relationshipStatus", formData.relationshipStatus || "");
      form.append("location", formData.location || "");

      // Files
      if (formData.profileFile) form.append("profilePic", formData.profileFile);
      if (formData.coverFile) form.append("coverPhoto", formData.coverFile);

      // Flags to remove photos
      if (formData.removeProfile) form.append("removeProfile", "true");
      if (formData.removeCover) form.append("removeCover", "true");

      const res = await fetch(`${BACKEND_URL}/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUserData(data.user ?? data);
      setIsModalOpen(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Upload failed");
    }
  };

  if (!userData) return <p className="text-center mt-20">Loading profile...</p>;

  return (
    <>
      <div className="min-h-screen bg-[#fbebff] py-6 px-2 sm:px-8 md:px-16 lg:px-24">
        {/* Cover Image */}
        <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
          <div className="relative h-48 md:h-64 bg-gray-300 rounded-bl-lg rounded-br-lg overflow-hidden">
            <img
              src={userData?.coverPhoto || "/defaultCoverPic.png"}
              alt="cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="relative -mt-12 md:-mt-16 flex md:px-0 px-5 md:py-0 py-2 flex-col md:flex-col items-start space-x-0 md:space-x-6">
            <div className="flex-shrink-0 ml-4 md:ml-10 -mt-6 md:mt-0">
              <img
                src={userData?.profilePic || "/defaultProfilePic.webp"}
                alt="profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>

            <div className="flex flex-col md:flex-row ml-4 md:ml-10 mt-4 justify-between md:px-4 w-full">
              <div className="flex flex-col justify-center mb-3 md:mb-5">
                <h1 className="text-2xl md:text-3xl  text-[#310a49] font-bold">
                  {userData.name}
                </h1>
                <p className="text-[#9156F1]">@{userData.username}</p>
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
          <div className="col-span-1 text-[#310a49] flex flex-col gap-4 order-2 md:order-1">
            <div className="bg-white text-[#310a49] shadow-lg rounded-lg overflow-hidden p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                About
              </h3>
              <hr className="pb-2" />
              <div className="space-y-2 md:space-y-3 text-sm md:text-base">
                <div className="flex items-center space-x-2">
                  <GenderIcon className="w-5 h-5 text-[#310a49]" />
                  <span>{userData.gender || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DobIcon className="w-5 h-5 text-[#310a49]" />
                  <span>
                    {userData.dob
                      ? new Date(userData.dob).toLocaleDateString("en-GB")
                      : "Not provided"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-5 h-5 text-[#310a49]" />
                  <span>{userData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MailIcon className="w-5 h-5 text-[#310a49]" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LocationProfileIcon className="w-5 h-5 text-[#310a49]" />
                  <span>{userData.location || "Not specified"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <JobIcon className="w-5 h-5 text-[#310a49]" />
                  <span>{userData.job || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartIcon className="w-5 h-5 text-[#310a49]" />
                  <span>{userData.relationshipStatus || "Single"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="col-span-2 order-1 md:order-2 flex flex-col gap-4">
            <div className="bg-[#fbebff] shadow-lg rounded-lg overflow-hidden pt-3 md:pt-4 pb-4">
              <div className="flex border-b overflow-x-auto no-scrollbar">
                {["followers", "following", "contribution", "wishlist"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`flex-1 text-center py-2 md:py-3 font-semibold transition-transform duration-150 whitespace-nowrap ${
                        activeTab === tab
                          ? "border-b-2 text-[#310a49] border-[#9156F1] -translate-y-[1px]"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
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
                                src={item.images?.[0] || "/defaultCoverPic.png"}
                                alt={item.name}
                                className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                              />
                              <div className="flex flex-col">
                                <p className="font-medium text-gray-800 text-sm md:text-base">
                                  {item.name}
                                </p>
                                <p className="font-medium text-gray-800 text-xs md:text-sm">
                                  {item.district.name}
                                </p>
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
                      <p className="text-gray-500 text-center py-6 md:py-10">
                        Your wishlist is empty.
                      </p>
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
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );

                                if (!res.ok)
                                  throw new Error("Failed to unfollow");

                                setFollowing((prev) =>
                                  prev.filter((u) => u._id !== f._id)
                                );
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
                      <p className="text-gray-500 text-center col-span-full mt-4">
                        Not following anyone yet
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "contribution" && (
                  <div>
                    <button
                      className="w-full bg-[#9156F1] text-white py-2 rounded-lg flex items-center justify-center mb-4 hover:bg-yellow-500"
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
                              ? "bg-[#310a49] text-white"
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
                              c.verified
                                ? "border-green-500"
                                : "border-yellow-500"
                            }`}
                          >
                            <img
                              src={c.coverImage || "/defaultCoverPic.png"}
                              alt={c.description || "Contribution"}
                              className="w-full h-40 object-cover rounded mb-2"
                            />
                            <h4 className="font-bold">
                              {c.location?.name || "Unknown Location"}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {c.description}
                            </p>
                            <p
                              className={`mt-1 text-xs font-semibold ${
                                c.verified
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {c.verified ? "✅ Approved" : "🕒 Pending"}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals unchanged */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] md:w-full max-w-lg px-8 py-4 rounded-lg shadow-lg overflow-y-auto max-h-[800px]">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center">
                Edit Profile
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
              >
                ×
              </button>

              <div className="space-y-3 md:space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-3">
                  <label className="font-semibold text-gray-700">
                    Profile Picture
                  </label>
                  <img
                    src={formData.profileImage || "/defaultProfile.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                  <div className="flex space-x-3">
                    <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData({
                                ...formData,
                                profileImage: reader.result,
                                profileFile: file,
                                removeProfile: false,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {formData.profileImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            profileImage: "",
                            profileFile: null,
                            removeProfile: true,
                          })
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Photo */}
                <div className="flex flex-col items-center space-y-3 mt-4">
                  <label className="font-semibold text-gray-700">
                    Cover Photo
                  </label>
                  <img
                    src={formData.coverImage || "/defaultCover.png"}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-lg border shadow-sm"
                  />
                  <div className="flex space-x-3">
                    <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData({
                                ...formData,
                                coverImage: reader.result,
                                coverFile: file,
                                removeCover: false,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            coverImage: "",
                            coverFile: null,
                            removeCover: true,
                          })
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Other Form Fields */}
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Bio"
                  rows={3}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || ""}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                >
                  <option value="Not Selected">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  name="job"
                  value={formData.job || ""}
                  onChange={handleInputChange}
                  placeholder="Occupation"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                />
                <select
                  name="relationshipStatus"
                  value={formData.relationshipStatus || ""}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                >
                  <option value="Not Selected">
                    Select Relationship Status
                  </option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddContributionModal
          isOpen={isAddContributionOpen}
          onClose={() => setIsAddContributionOpen(false)}
          onSave={(contributionData) =>
            handleSaveContribution(contributionData)
          }
          locationId={location._id}
        />
      </div>
    </>
  );
};
