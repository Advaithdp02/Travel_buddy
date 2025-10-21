import React, { useEffect, useState, useRef } from "react";

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

const Backend_URL = import.meta.env.VITE_BACKEND_URL;

export const AddContributionModal = ({ isOpen, onClose, locationId }) => {
  const [districts, setDistricts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  // handle standard input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // handle multi-select options like activities and facilities
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

  // handle ratings
  const handleRatingChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value },
    }));
  };

  // handle image uploads
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, coverImage: file }));
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  // drag and drop for images
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (files.length) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
      setPreviewImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleSave = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to add a contribution.");
    return;
  }

  try {
    const data = new FormData();
    data.append("location", formData.location);
    data.append("description", formData.description);
    data.append("bestTimeToVisit", formData.bestTimeToVisit);
    data.append("crowded", formData.crowded);
    data.append("familyFriendly", formData.familyFriendly);
    data.append("petFriendly", formData.petFriendly);
    data.append("accessibility", formData.accessibility);
    data.append("activities", JSON.stringify(formData.activities));
    data.append("facilities", JSON.stringify(formData.facilities));
    data.append("ratings", JSON.stringify(formData.ratings));
    data.append("tips", formData.tips);
    data.append("hiddenGems", JSON.stringify(formData.hiddenGems));

    if (formData.coverImage) data.append("coverImage", formData.coverImage);
    formData.images.forEach((file) => data.append("images", file));

    const res = await fetch(`${Backend_URL}/contributions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error saving contribution:", errorData);
      alert("Failed to save contribution.");
      return;
    }

    const responseData = await res.json();
    console.log("Contribution saved successfully:", responseData);
    alert("Contribution added successfully!");
    
    onClose();
  } catch (err) {
    console.error("Error posting contribution:", err);
    alert("An error occurred while saving.");
  }
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
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, [formData.district]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Add Contribution</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-2xl">×</button>

        {/* District & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              disabled={!formData.district}
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <p className="font-semibold mb-2 text-lg">Describe this place:</p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>

          {/* Cover Image */}
          <div>
            <p className="font-semibold mb-2 text-lg">Cover Image:</p>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
            {coverPreview && <img src={coverPreview} className="mt-2 w-32 h-32 object-cover rounded-lg border" />}
          </div>

          {/* Drag & Drop Images */}
          <div
            className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
          >
            <p>Drag & drop images here, or click to select</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleImagesChange}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {previewImages.map((img, idx) => (
              <img key={idx} src={img} alt="preview" className="w-24 h-24 object-cover rounded-lg border" />
            ))}
          </div>

          {/* Best Time */}
          <div>
            <p className="font-semibold mb-2 text-lg">Best time to visit:</p>
            <div className="flex flex-wrap gap-2">
              {bestTimes.map((time) => (
                <span
                  key={time}
                  className={`px-4 py-2 rounded-full cursor-pointer border ${
                    formData.bestTimeToVisit === time
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                  onClick={() => setFormData({ ...formData, bestTimeToVisit: time })}
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <p className="font-semibold mb-2 text-lg">Options:</p>
            <div className="flex flex-wrap gap-2">
              {["crowded", "familyFriendly", "petFriendly"].map((opt) => (
                <span
                  key={opt}
                  className={`px-4 py-2 rounded-full cursor-pointer border ${
                    formData[opt] ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, [opt]: !prev[opt] }))}
                >
                  {opt === "crowded"
                    ? "Crowded"
                    : opt === "familyFriendly"
                    ? "Family-Friendly"
                    : "Pet-Friendly"}
                </span>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <p className="font-semibold mb-2 text-lg">Accessibility:</p>
            <div className="flex flex-wrap gap-2">
              {accessibilityOptions.map((opt) => (
                <span
                  key={opt}
                  className={`px-4 py-2 rounded-full cursor-pointer border ${
                    formData.accessibility === opt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                  onClick={() => setFormData({ ...formData, accessibility: opt })}
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <p className="font-semibold mb-2 text-lg">Activities:</p>
            <div className="flex flex-wrap gap-2">
              {activitiesList.map((act) => (
                <span
                  key={act}
                  className={`px-4 py-2 rounded-full cursor-pointer border ${
                    formData.activities.includes(act)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                  onClick={() => handleMultiSelect("activities", act)}
                >
                  {act}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <p className="font-semibold mb-2 text-lg">Facilities:</p>
            <div className="flex flex-wrap gap-2">
              {facilitiesList.map((fac) => (
                <span
                  key={fac}
                  className={`px-4 py-2 rounded-full cursor-pointer border ${
                    formData.facilities.includes(fac)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                  onClick={() => handleMultiSelect("facilities", fac)}
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <p className="font-semibold mb-2 text-lg">Ratings:</p>
            {Object.keys(formData.ratings).map((cat) => (
              <div key={cat} className="flex items-center mb-1 gap-2">
                <span className="capitalize w-32">{cat}:</span>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`px-2 text-2xl ${
                      formData.ratings[cat] >= num ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => handleRatingChange(cat, num)}
                  >
                    ★
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div>
            <p className="font-semibold mb-2 text-lg">Tips / Hidden Gems:</p>
            <textarea
              name="tips"
              value={formData.tips}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Any tips for fellow travelers?"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Contribution</button>
        </div>
      </div>
    </div>
  );
};

export default AddContributionModal;
