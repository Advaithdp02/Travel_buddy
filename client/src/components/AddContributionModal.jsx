import React, { useEffect, useState } from "react";

const activitiesList = [
  "Sightseeing",
  "Photography",
  "Adventure / Trekking",
  "Beach / Swimming",
  "Cultural / Historical",
  "Food / Restaurants",
  "Relaxation / Meditation",
  "Shopping",
];

const facilitiesList = [
  "Toilets / Restrooms",
  "Parking",
  "Public Transport",
  "Cafes / Restaurants",
  "Souvenir Shops",
  "Wheelchair Accessible",
  "Entry Fee / Paid",
];

const bestTimes = ["Morning", "Afternoon", "Evening", "Sunrise", "Sunset", "Anytime"];
const accessibilityOptions = ["Easy", "Moderate", "Difficult", "Unknown"];

const Backend_URL = import.meta.env.VITE_BACKEND_URL
export const AddContributionModal = ({ isOpen, onClose,  locationId }) => {
  const [districts, setDistricts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    user: "",
    district: "",
    location: "",
    description: "",
    locationId: locationId || "",
    images: [],
    coverImage: "",
    bestTimeToVisit: "",
    crowded: false,
    familyFriendly: true,
    petFriendly: false,
    accessibility: "Unknown",
    activities: [],
    facilities: [],
    ratings: { overall: 0, cleanliness: 0, safety: 0, crowd: 0, valueForMoney: 0 },
    tips: "",
    hiddenGems: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      console.log(formData);
    }
  };

  const handleMultiSelect = (name, option) => {
    setFormData((prev) => {
      const current = prev[name];
      if (current.includes(option)) {
        return { ...prev, [name]: current.filter((o) => o !== option) };
      } else {
        return { ...prev, [name]: [...current, option] };
      }
    });
  };

  const handleRatingChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value },
    }));
  };

  const handleSave = () => {
    const handleSave = async () => {
      const token = localStorage.getItem("token");
      setFormData((prev) => ({ ...prev, user: localStorage.getItem("userId") || "" }));

      if (!token) {
    alert("You must be logged in to add a contribution.");
    return;
  }
  try {
    const res = await fetch(`${Backend_URL}/contributions`, {
      method: "POST",
      headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error saving contribution:", errorData);
      alert("Failed to save contribution.");
      return;
    }

    const data = await res.json();
    console.log("Contribution saved successfully:", data);

    

    alert("Contribution added successfully!");
    onClose(); // close modal
  } catch (err) {
    console.error("Error posting contribution:", err);
    alert("An error occurred while saving.");
  }
};
    handleSave();
  };

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`${Backend_URL}/districts`);
        if (!res.ok) throw new Error("Failed to fetch districts");
        const data = await res.json();
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.district) {
        setLocations([]);
        return;
      }

      try {
        const res = await fetch(`${Backend_URL}/locations/district/${formData.district}`);
        if (!res.ok) throw new Error("Failed to fetch locations");
        const data = await res.json();
        console.log(data);
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, [formData.district]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Add Contribution</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">
          ×
        </button>
        {/* DISTRICT SELECT */}
      <div className="flex flex-col mb-3">
        <label className="font-semibold mb-1">District</label>
        <select
          name="district"
          value={formData.district}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district._id} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {/* LOCATION SELECT */}
      <div className="flex flex-col mb-3">
        <label className="font-semibold mb-1">Location</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg"
          disabled={!formData.district}
        >
          <option value="">Select Location</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>


        {/* Description */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
            rows={4}
          />
        </div>

        {/* Best Time */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Best Time to Visit</label>
          <select
            name="bestTimeToVisit"
            value={formData.bestTimeToVisit}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select</option>
            {bestTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col mb-3 space-y-2">
          <label className="font-semibold">Options</label>
          <div>
            <label className="mr-4">
              <input type="checkbox" name="crowded" checked={formData.crowded} onChange={handleChange} /> Crowded
            </label>
            <label className="mr-4">
              <input type="checkbox" name="familyFriendly" checked={formData.familyFriendly} onChange={handleChange} /> Family-Friendly
            </label>
            <label className="mr-4">
              <input type="checkbox" name="petFriendly" checked={formData.petFriendly} onChange={handleChange} /> Pet-Friendly
            </label>
          </div>
        </div>

        {/* Accessibility */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Accessibility</label>
          <select
            name="accessibility"
            value={formData.accessibility}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          >
            {accessibilityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Activities */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Activities</label>
          <div className="flex flex-wrap gap-2">
            {activitiesList.map((act) => (
              <label key={act} className="border px-2 py-1 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activities.includes(act)}
                  onChange={() => handleMultiSelect("activities", act)}
                  className="mr-1"
                />
                {act}
              </label>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Facilities</label>
          <div className="flex flex-wrap gap-2">
            {facilitiesList.map((fac) => (
              <label key={fac} className="border px-2 py-1 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(fac)}
                  onChange={() => handleMultiSelect("facilities", fac)}
                  className="mr-1"
                />
                {fac}
              </label>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Ratings</label>
          {Object.keys(formData.ratings).map((cat) => (
            <div key={cat} className="flex items-center mb-1">
              <span className="capitalize mr-2">{cat}:</span>
              {[1,2,3,4,5].map((num) => (
                <button
                  key={num}
                  className={`px-2 ${formData.ratings[cat] >= num ? "text-yellow-500" : "text-gray-400"}`}
                  onClick={() => handleRatingChange(cat, num)}
                >
                  ★
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Tips / Hidden Gems */}
        <div className="flex flex-col mb-3">
          <label className="font-semibold mb-1">Tips</label>
          <textarea
            name="tips"
            value={formData.tips}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};
export default AddContributionModal;