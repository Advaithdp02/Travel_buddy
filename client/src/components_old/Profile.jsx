import React, { useEffect, useState } from "react";
import { LocationIcon, PhoneIcon, MailIcon, GenderIcon, DobIcon, JobIcon, HeartIcon } from "./Icons";
import { Header } from "./Header";
import { AddContributionModal } from "./AddContributionModal";
export const Profile = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [contribSubTab, setContribSubTab] = useState("all");
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};

useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("Token:", token);
  if (!token) {
    console.warn("User not logged in");
    return;
  }

  const fetchUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
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

      setUserData(user);
      setFormData(initialForm);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  fetchUser();
}, []);


const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

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
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
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
      <Header variant="light" />
      <div className="min-h-screen bg-gray-100 mt-20 py-6 px-4 sm:px-8 md:px-16 lg:px-24">
        {/* Cover Image */}
        <div className="bg-white shadow-lg rounded-bl-lg rounded-br-lg overflow-hidden">
          <div className="relative h-64 bg-gray-300 rounded-bl-lg rounded-br-lg overflow-hidden">
            <img
              src={userData?.coverImage || "https://picsum.photos/1200/400"}
              alt="cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile info */}
          <div className="relative -mt-16 flex-col items-start space-x-6">
            <div className="flex-shrink-0 ml-10">
              <img
                src={userData?.profileImage || "https://i.pravatar.cc/150"}
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
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Edit Profile
                </button>
                <button onClick={logout} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">
                  Logout
                </button>
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
                    <button className="w-full bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center mb-4 hover:bg-yellow-500" onClick={() => setIsAddContributionOpen(true)}>
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

        {/* Edit Profile Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">
                ×
              </button>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {/* name */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Name</label>
                  <input name="name" value={formData.name || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg" />
                </div>

                {/* username */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Username</label>
                  <input name="username" value={formData.username || ""} onChange={handleInputChange} readOnly className="border px-3 py-2 rounded-lg cursor-not-allowed" />
                </div>

                {/* bio */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Bio</label>
                  <input name="bio" value={formData.bio || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg" />
                </div>

                {/* gender */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Gender</label>
                  <select name="gender" value={formData.gender || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* dob */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Date of Birth</label>
                  <input name="dob" type="date" value={formData.dob || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg" />
                </div>

                {/* phone */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Phone</label>
                  <input name="phone" value={formData.phone || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg" />
                </div>

                {/* email */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Email</label>
                  <input name="email" type="email" value={formData.email || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg" />
                </div>

                {/* District (Kerala) */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">District (Kerala)</label>
                  <select name="district" value={formData.district || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg">
                    <option value="">Select District</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kollam">Kollam</option>
                    <option value="Pathanamthitta">Pathanamthitta</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Kottayam">Kottayam</option>
                    <option value="Idukki">Idukki</option>
                    <option value="Ernakulam">Ernakulam</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Palakkad">Palakkad</option>
                    <option value="Malappuram">Malappuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Wayanad">Wayanad</option>
                    <option value="Kannur">Kannur</option>
                    <option value="Kasaragod">Kasaragod</option>
                  </select>
                </div>

                {/* job -> occupation */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Job</label>
                  <input name="job" value={formData.job || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg" />
                </div>

                {/* relationship -> relationshipStatus */}
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Relationship</label>
                  <select name="relationship" value={formData.relationship || ""} onChange={handleInputChange} className="border px-3 py-2 rounded-lg">
                    <option value="">Select Relationship</option>
                    <option value="Single">Single</option>
                    <option value="In a Relationship">In a Relationship</option>
                    <option value="Married">Married</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        <AddContributionModal
  isOpen={isAddContributionOpen}
  onClose={() => setIsAddContributionOpen(false)}
  onSave={(contributionData) => handleSaveContribution(contributionData)}
  locationId={location._id} // assuming you have the location object
/>


      </div>
    </>
  );
};
