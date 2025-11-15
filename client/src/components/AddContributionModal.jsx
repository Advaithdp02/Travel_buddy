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

export const AddContributionModal = ({ isOpen, onClose }) => {
  const [districts, setDistricts] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    district: "",
    description: "",
    latitude: "",
    longitude: "",
    images: [],
    coverImage: "",
    bestTimeToVisit: "",
    crowded: false,
    familyFriendly: true,
    petFriendly: false,
    accessibility: "Unknown",
    activities: [],
    facilities: [],
    ratings: {
      overall: 0,
      cleanliness: 0,
      safety: 0,
      crowd: 0,
      valueForMoney: 0,
    },
    tips: "",
    hiddenGems: [],
    points: [],
  });

  // -----------------------------
  // Input handlers
  // -----------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((i) => i !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleRatingChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [category]: value },
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, coverImage: file }));
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));

    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setPreviewImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  // -----------------------------
  // API: Save Contribution
  // -----------------------------

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("district", formData.district);
      data.append("description", formData.description);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);

      data.append("bestTimeToVisit", formData.bestTimeToVisit);
      data.append("crowded", formData.crowded);
      data.append("familyFriendly", formData.familyFriendly);
      data.append("petFriendly", formData.petFriendly);
      data.append("accessibility", formData.accessibility);

      data.append("activities", JSON.stringify(formData.activities));
      data.append("facilities", JSON.stringify(formData.facilities));
      data.append("ratings", JSON.stringify(formData.ratings));
      data.append("hiddenGems", JSON.stringify(formData.hiddenGems));
      data.append("points", JSON.stringify(formData.points));

      data.append("tips", formData.tips);

      if (formData.coverImage) data.append("coverImage", formData.coverImage);
      formData.images.forEach((file) => data.append("images", file));

      const res = await fetch(`${Backend_URL}/contributions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to save.");

      alert("Contribution submitted! Awaiting admin approval.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving contribution.");
    }
  };

  // -----------------------------
  // Fetch districts
  // -----------------------------

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`${Backend_URL}/districts`);
        const data = await res.json();
        setDistricts(data);
      } catch (err) {
        console.error("Error loading districts:", err);
      }
    };

    fetchDistricts();
  }, []);

  if (!isOpen) return null;

  // -----------------------------
  // MODAL UI
  // -----------------------------

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Add a New Place
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-2xl font-bold hover:text-black"
        >
          ×
        </button>

        {/* Title */}
        <div className="mb-4">
          <label className="font-semibold">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Eg: Dharmadam Island"
          />
        </div>

        {/* Subtitle */}
        <div className="mb-4">
          <label className="font-semibold">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Eg: A hidden gem in Kannur"
          />
        </div>

        {/* District */}
        <div className="mb-4">
          <label className="font-semibold">District *</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-semibold">Latitude *</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              placeholder="Eg: 11.78945"
            />
          </div>

          <div>
            <label className="font-semibold">Longitude *</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              placeholder="Eg: 75.35599"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="font-semibold">Description *</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Describe this place..."
          />
        </div>

        {/* Cover Image */}
        <div className="mb-4">
          <label className="font-semibold">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} />
          {coverPreview && (
            <img
              src={coverPreview}
              className="w-32 h-32 mt-2 rounded-lg object-cover border"
            />
          )}
        </div>

        {/* Image Upload */}
        <div
          className="border-2 border-dashed p-4 rounded-lg text-center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          <p>Drag & drop images here or click to upload</p>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImagesChange}
          />
        </div>

        {/* Image Previews */}
        <div className="flex flex-wrap gap-2 mt-3">
          {previewImages.map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-24 h-24 rounded-lg border object-cover"
            />
          ))}
        </div>

        {/* Best Time */}
        <div className="mt-4">
          <label className="font-semibold">Best Time to Visit</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {bestTimes.map((t) => (
              <span
                key={t}
                className={`px-4 py-2 border rounded-full cursor-pointer ${
                  formData.bestTimeToVisit === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, bestTimeToVisit: t }))
                }
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mt-4">
          <label className="font-semibold">Options</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["crowded", "familyFriendly", "petFriendly"].map((opt) => (
              <span
                key={opt}
                className={`px-4 py-2 border rounded-full cursor-pointer ${
                  formData[opt] ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, [opt]: !prev[opt] }))
                }
              >
                {opt === "crowded"
                  ? "Crowded"
                  : opt === "familyFriendly"
                  ? "Family Friendly"
                  : "Pet Friendly"}
              </span>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="mt-4">
          <label className="font-semibold">Accessibility</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {accessibilityOptions.map((opt) => (
              <span
                key={opt}
                className={`px-4 py-2 border rounded-full cursor-pointer ${
                  formData.accessibility === opt
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, accessibility: opt }))
                }
              >
                {opt}
              </span>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="mt-4">
          <label className="font-semibold">Activities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {activitiesList.map((act) => (
              <span
                key={act}
                className={`px-4 py-2 border rounded-full cursor-pointer ${
                  formData.activities.includes(act)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => handleMultiSelect("activities", act)}
              >
                {act}
              </span>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="mt-4">
          <label className="font-semibold">Facilities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {facilitiesList.map((fac) => (
              <span
                key={fac}
                className={`px-4 py-2 border rounded-full cursor-pointer ${
                  formData.facilities.includes(fac)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => handleMultiSelect("facilities", fac)}
              >
                {fac}
              </span>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="mt-4">
          <label className="font-semibold">Ratings</label>
          {Object.keys(formData.ratings).map((cat) => (
            <div key={cat} className="flex items-center gap-2 mt-2">
              <span className="capitalize w-32">{cat}:</span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`text-2xl ${
                    formData.ratings[cat] >= num
                      ? "text-yellow-400"
                      : "text-gray-300"
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
        <div className="mt-4">
          <label className="font-semibold">Tips / Hidden Gems</label>
          <textarea
            name="tips"
            rows="3"
            value={formData.tips}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* SAVE */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Contribution
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContributionModal;
