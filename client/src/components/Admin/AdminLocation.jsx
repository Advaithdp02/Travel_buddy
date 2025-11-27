import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Modal,
  Grid,
} from "@mui/material";

import LocationBulkAddModal from "./LocationBulkAddModal"; // ADDED

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);

  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Add Location Modal
  const [open, setOpen] = useState(false);

  // Bulk Upload Modal
  const [openBulk, setOpenBulk] = useState(false); // ADDED

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    district: "",
    terrain: "",
    description: "",
    subtitle: "",
    points: "",
    longitude: "",
    latitude: "",
    images: [],
    existingImages: [],
    review: "",
    reviewLength: "",
    roadSideAssistant: "",
    policeStation: "",
    ambulance: "",
    localSupport: "",
  });

  const [deletedImages, setDeletedImages] = useState([]);

  const token = localStorage.getItem("token");

  // ---------------- Fetch Districts ----------------
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`);
        setDistricts(res.data);

        const unique = [...new Set(res.data.map((d) => d.State))];
        setStates(unique);
      } catch (err) {
        console.error("District fetch failed:", err);
      }
    };
    fetchDistricts();
  }, []);

  // ---------------- Fetch Locations ----------------
  const fetchLocations = async (districtId) => {
    if (!districtId) {
      setLocations([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/locations/district/${districtId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations(res.data);
    } catch (err) {
      console.error("Load locations failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- State Change ----------------
  const handleStateChange = (value) => {
    setSelectedState(value);
    setSelectedDistrict("");
    setLocations([]);
    setSearch("");
  };

  // ---------------- District Change ----------------
  const handleDistrictChange = (districtId) => {
    setSelectedDistrict(districtId);
    setSearch("");
    fetchLocations(districtId);
  };

  // ---------------- Filter ----------------
  const filteredLocations = locations.filter((loc) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(s) ||
      loc.terrain?.toLowerCase().includes(s) ||
      loc.subtitle?.toLowerCase().includes(s)
    );
  });

  // ---------------- Delete ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ---------------- Edit Modal ----------------
  const openModalForEdit = (loc) => {
    setFormData({
      _id: loc._id,
      name: loc.name,
      district: loc.district?._id || "",
      terrain: loc.terrain,
      description: loc.description,
      subtitle: loc.subtitle,
      points: loc.points?.join(",") || "",
      longitude: loc.coordinates.coordinates[0],
      latitude: loc.coordinates.coordinates[1],
      images: [],
      existingImages: loc.images || [],
      review: loc.review || "",
      reviewLength: loc.reviewLength || "",
      roadSideAssistant: loc.roadSideAssistant || "",
      policeStation: loc.policeStation || "",
      ambulance: loc.ambulance || "",
      localSupport: loc.localSupport || "",
    });
    setOpen(true);
  };

  // ---------------- Form Input ----------------
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, images: files });
    else setFormData({ ...formData, [name]: value });
  };

  // ---------------- Submit ----------------
  const handleSubmit = async () => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "images" && key !== "existingImages") {
          data.append(key, formData[key]);
        }
      });

      data.append(
        "coordinates",
        JSON.stringify([
          parseFloat(formData.longitude),
          parseFloat(formData.latitude),
        ])
      );

      formData.points
        .split(",")
        .map((p) => p.trim())
        .forEach((pt) => {
          if (pt) data.append("points", pt);
        });

      if (deletedImages.length > 0) {
        data.append("deletedImages", JSON.stringify(deletedImages));
      }

      if (formData.images?.length > 0) {
        [...formData.images].forEach((file) => data.append("images", file));
      }

      if (formData._id) {
        await axios.put(`${BACKEND_URL}/locations/${formData._id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${BACKEND_URL}/locations`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchLocations(selectedDistrict);
      setOpen(false);
      setDeletedImages([]);
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  // ---------------- Remove Image ----------------
  const handleRemoveImage = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((i) => i !== imgUrl),
    }));
    setDeletedImages((prev) => [...prev, imgUrl]);
  };

  // ---------------- Bulk Upload Handler (ADDED) ----------------
  const handleBulkUpload = async ({ file }) => {
    try {
      if (!selectedDistrict) {
        alert("Please select a district before uploading.");
        return;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("districtId", selectedDistrict);

      await axios.post(`${BACKEND_URL}/locations/bulk/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Bulk upload successful!");
      setOpenBulk(false);
      fetchLocations(selectedDistrict);
    } catch (err) {
      console.error("Bulk Upload Error:", err.response?.data || err);
      alert("Bulk upload failed.");
    }
  };

  // ---------------- UI ----------------
  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-4 font-bold">
        Manage Locations
      </Typography>

      {/* ---------------- State Select ---------------- */}
      <FormControl fullWidth className="mb-4">
        <InputLabel>Select State</InputLabel>
        <Select
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
        >
          <MenuItem value="">-- Select State --</MenuItem>
          {states.map((st) => (
            <MenuItem key={st} value={st}>
              {st}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ---------------- District Select ---------------- */}
      <FormControl fullWidth className="mb-6">
        <InputLabel>Select District</InputLabel>
        <Select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!selectedState}
        >
          <MenuItem value="">-- Select District --</MenuItem>
          {districts
            .filter((d) => d.State === selectedState)
            .map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {!selectedDistrict && (
        <Typography className="text-gray-600">
          Select a state & district
        </Typography>
      )}

      {selectedDistrict && (
        <>
          {/* Search */}
          <TextField
            label="Search locations..."
            fullWidth
            className="mb-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Add + Bulk Upload Buttons */}
          <Box className="flex gap-3 mb-4">
            <Button
              variant="contained"
              onClick={() => {
                setFormData({
                  _id: null,
                  name: "",
                  district: selectedDistrict || "", // auto-fill district
                  terrain: "none",
                  description: "",
                  subtitle: "",
                  points: "",
                  longitude: "",
                  latitude: "",
                  images: [],
                  existingImages: [],
                  review: "",
                  reviewLength: "",
                  roadSideAssistant: "",
                  policeStation: "",
                  ambulance: "",
                  localSupport: "",
                });
                setDeletedImages([]);
                setOpen(true);
              }}
            >
              + Add Location
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => setOpenBulk(true)}
            >
              + Bulk Upload
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredLocations.map((loc) => (
                <Grid item xs={12} sm={6} md={4} key={loc._id}>
                  <Card className="shadow-md rounded-xl bg-white overflow-hidden">
                    {loc.images?.[0] && (
                      <img
                        src={loc.images[0]}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <CardContent>
                      <Typography variant="h6">{loc.name}</Typography>
                      <Typography variant="body2">{loc.terrain}</Typography>
                      <Typography variant="body2" className="mt-1">
                        {loc.coordinates.coordinates.join(", ")}
                      </Typography>

                      <Box className="flex gap-2 mt-4">
                        <Button
                          variant="contained"
                          onClick={() => openModalForEdit(loc)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(loc._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* ---------------- Bulk Modal (ADDED) ---------------- */}
      <LocationBulkAddModal
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        onUpload={handleBulkUpload}
      />

      {/* ---------------- Add / Edit Location Modal (YOUR ORIGINAL MODAL) ---------------- */}
      {/* ---------------- Add / Edit Location Modal ---------------- */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          className="
      absolute top-1/2 left-1/2 w-[32rem] max-h-[90vh]
      -translate-x-1/2 -translate-y-1/2
      bg-white p-6 rounded-xl shadow-lg
      overflow-y-auto
    "
        >
          <Typography variant="h6" className="mb-4 font-bold">
            {formData._id ? "Edit Location" : "Add New Location"}
          </Typography>

          {/* Name */}
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={handleFormChange}
          />

          {/* District */}
          <FormControl fullWidth margin="dense">
            <InputLabel>District</InputLabel>
            <Select
              name="district"
              value={formData.district}
              onChange={handleFormChange}
            >
              {districts.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            value={formData.description}
            onChange={handleFormChange}
          />

          {/* Subtitle */}
          <TextField
            label="Subtitle"
            name="subtitle"
            fullWidth
            margin="dense"
            value={formData.subtitle}
            onChange={handleFormChange}
          />

          {/* Review */}
          <TextField
            label="Review"
            name="review"
            fullWidth
            margin="dense"
            value={formData.review}
            onChange={handleFormChange}
          />

          {/* Review Length */}
          <TextField
            label="Review Length"
            name="reviewLength"
            fullWidth
            margin="dense"
            value={formData.reviewLength}
            onChange={handleFormChange}
          />

          {/* Points */}
          <TextField
            label="Points (comma separated)"
            name="points"
            fullWidth
            margin="dense"
            value={formData.points}
            onChange={handleFormChange}
          />

          {/* TERRAIN */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Terrain</InputLabel>
            <Select
              name="terrain"
              value={formData.terrain}
              onChange={handleFormChange}
            >
              <MenuItem value="none">Select Terrain</MenuItem>
              <MenuItem value="Mountain">Mountains</MenuItem>
              <MenuItem value="Beach">Beaches</MenuItem>
              <MenuItem value="Forest">Forests</MenuItem>
              <MenuItem value="Desert">Deserts</MenuItem>
              <MenuItem value="Plain">Plains</MenuItem>
              <MenuItem value="Rocky">Rocky</MenuItem>
              <MenuItem value="River">River</MenuItem>
              <MenuItem value="Hilly">Hilly</MenuItem>
              <MenuItem value="Urban">Urban</MenuItem>
            </Select>
          </FormControl>

          {/* COORDINATES */}
          <Box className="flex gap-2 mt-2">
            <TextField
              label="Longitude"
              name="longitude"
              fullWidth
              value={formData.longitude}
              onChange={handleFormChange}
            />
            <TextField
              label="Latitude"
              name="latitude"
              fullWidth
              value={formData.latitude}
              onChange={handleFormChange}
            />
          </Box>

          {/* EMERGENCY CONTACTS */}
          <Typography variant="subtitle1" className="mt-4 font-semibold">
            Emergency Contacts
          </Typography>

          <TextField
            label="Roadside Assistance"
            name="roadSideAssistant"
            fullWidth
            margin="dense"
            value={formData.roadSideAssistant}
            onChange={handleFormChange}
          />

          <TextField
            label="Police Station"
            name="policeStation"
            fullWidth
            margin="dense"
            value={formData.policeStation}
            onChange={handleFormChange}
          />

          <TextField
            label="Ambulance"
            name="ambulance"
            fullWidth
            margin="dense"
            value={formData.ambulance}
            onChange={handleFormChange}
          />

          <TextField
            label="Local Support"
            name="localSupport"
            fullWidth
            margin="dense"
            value={formData.localSupport}
            onChange={handleFormChange}
          />

          {/* IMAGE UPLOAD */}
          <input
            type="file"
            name="images"
            multiple
            onChange={handleFormChange}
            className="mt-2"
          />

          {/* Existing Images Preview */}
          {formData.existingImages?.length > 0 && (
            <Box className="flex gap-2 mt-2 flex-wrap">
              {formData.existingImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </Box>
          )}

          {/* ACTION BUTTONS */}
          <Box className="flex justify-end mt-4 gap-2">
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {formData._id ? "Update" : "Save"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
