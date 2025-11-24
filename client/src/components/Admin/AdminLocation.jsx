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

  // Modal + Form
  const [open, setOpen] = useState(false);

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

  // ---------------- Fetch D I S T R I C T S  ----------------
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`);
        setDistricts(res.data);

        // Extract states
        const unique = [...new Set(res.data.map((d) => d.State))];
        setStates(unique);

      } catch (err) {
        console.error("Districts fetch failed", err);
      }
    };

    fetchDistricts();
  }, []);

  // ---------------- Fetch Locations for District ----------------
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
      console.error("Failed to load locations", err);
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

  // ---------------- Filter Locations by Search ----------------
  const filteredLocations = locations.filter((loc) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();

    return (
      loc.name.toLowerCase().includes(s) ||
      loc.terrain?.toLowerCase().includes(s) ||
      loc.subtitle?.toLowerCase().includes(s)
    );
  });

  // ---------------- Delete Location ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLocations((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ---------------- Open Edit Modal ----------------
  const openModalForEdit = (loc) => {
    setFormData({
      _id: loc._id,
      name: loc.name,
      district: loc.district?._id || "",
      terrain: loc.terrain,
      description: loc.description,
      subtitle: loc.subtitle,
      points: loc.points ? loc.points.join(",") : "",
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

  // ---------------- Handle Form Input ----------------
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, images: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ---------------- Submit Form ----------------
  const handleSubmit = async () => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key !== "images" &&
          key !== "existingImages"
        ) {
          data.append(key, formData[key]);
        }
      });

      data.append(
        "coordinates",
        JSON.stringify([parseFloat(formData.longitude), parseFloat(formData.latitude)])
      );

      // points as array
      formData.points
        .split(",")
        .map((p) => p.trim())
        .forEach((pt) => data.append("points", pt));

      // deletedImages
      if (deletedImages.length > 0) {
        data.append("deletedImages", JSON.stringify(deletedImages));
      }

      // new images
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

  // ---------------- Remove image ----------------
  const handleRemoveImage = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((i) => i !== imgUrl),
    }));
    setDeletedImages((p) => [...p, imgUrl]);
  };

  // ---------------- UI ----------------
  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-4 font-bold">
        Manage Locations
      </Typography>

      {/* ---------------- Select State ---------------- */}
      <FormControl fullWidth className="mb-4">
        <InputLabel>Select State</InputLabel>
        <Select
          value={selectedState}
          label="Select State"
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

      {/* ---------------- Select District (dependent) ---------------- */}
      <FormControl fullWidth className="mb-6">
        <InputLabel>Select District</InputLabel>
        <Select
          value={selectedDistrict}
          label="Select District"
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

      {/* If no district selected */}
      {!selectedDistrict && (
        <Typography className="text-gray-600">Select a state & district</Typography>
      )}

      {/* After district selection */}
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

          <Button variant="contained" onClick={() => setOpen(true)} className="mb-4">
            + Add Location
          </Button>

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
                        <Button variant="contained" onClick={() => openModalForEdit(loc)}>
                          Edit
                        </Button>
                        <Button variant="contained" color="error" onClick={() => handleDelete(loc._id)}>
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

      {/* MODAL (UNCHANGED — keep yours below) */}
      {/* ... your same modal code ... */}

    </Box>
  );
}
