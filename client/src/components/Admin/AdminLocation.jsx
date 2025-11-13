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
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  // Modal & form state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    terrain: "",
    district: "",
    description: "",
    longitude: "",
    latitude: "",
    subtitle: "",
    points: [],
    images: [],
    existingImages: [],
  });

  const token = localStorage.getItem("token");
  const fetchLocations = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(res.data);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      } finally {
        setLoading(false);
      }
    };

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    

    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`);
        setDistricts(res.data);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
    };

    fetchLocations();
    fetchDistricts();
  }, [token]);

  // ---------------- CRUD Handlers ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(locations.filter((loc) => loc._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, images: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModalForEdit = (loc) => {
    setFormData({
      _id: loc._id,
      name: loc.name,
      terrain: loc.terrain,
      district: loc.district?._id || "",
      description: loc.description,
      subtitle: loc.subtitle || "",
      points: loc.points ? loc.points.join(",") : "",
      longitude: loc.coordinates?.coordinates[0] || "",
      latitude: loc.coordinates?.coordinates[1] || "",
      images: [],
      existingImages: loc.images || [],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
  try {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("terrain", formData.terrain);
    data.append("district", formData.district);
    data.append("description", formData.description);
    data.append(
      "coordinates",
      JSON.stringify([parseFloat(formData.longitude), parseFloat(formData.latitude)])
    );
    data.append("subtitle", formData.subtitle);

    const pointsArray = formData.points.split(",").map((p) => p.trim());
    pointsArray.forEach((point) => data.append("points", point));

    if (formData.images?.length > 0) {
      for (const file of formData.images) {
        data.append("images", file);
      }
    }

    let res;
    if (formData._id) {
      // UPDATE
      res = await axios.put(`${BACKEND_URL}/locations/${formData._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

    } else {
      // CREATE
      res = await axios.post(`${BACKEND_URL}/locations`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // 🔥 Refresh list after update or create
    await fetchLocations();

    // Close modal + reset
    setOpen(false);
    setFormData({
      _id: null,
      name: "",
      district: "",
      description: "",
      longitude: "",
      latitude: "",
      subtitle: "",
      points: "",
      terrain: "",
      images: [],
      existingImages: [],
    });

  } catch (err) {
    console.error("Submit failed:", err);
  }
};


  // ---------------- Filtering Logic ----------------
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.terrain?.toLowerCase().includes(search.toLowerCase()) ||
      loc.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
      (loc.points &&
        loc.points.join(" ").toLowerCase().includes(search.toLowerCase()));

    const matchesDistrict =
      !districtFilter || loc.district?._id === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  if (loading)
    return <Typography className="p-6">Loading locations...</Typography>;

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-4 font-bold">
        Manage Locations
      </Typography>

      {/* Search Bar + District Sort */}
      <Box className="flex gap-4 mb-6">
        <TextField
          label="Search locations..."
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel>Filter by District</InputLabel>
          <Select
            value={districtFilter}
            label="Filter by District"
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <MenuItem value="">All Districts</MenuItem>
            {districts.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        className="mb-4"
      >
        + Add New Location
      </Button>

      {/* Cards List */}
      <Grid container spacing={4}>
        {filteredLocations.map((loc) => (
          <Grid item xs={12} sm={6} md={4} key={loc._id}>
            <Card className="shadow-md rounded-xl bg-white overflow-hidden">
              {loc.images && loc.images[0] && (
                <img
                  src={loc.images[0]}
                  alt={loc.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent>
                <Typography variant="h6">{loc.name}</Typography>

                <Typography variant="body2" color="textSecondary">
                  District: {loc.district?.name || "N/A"}
                </Typography>

                <Typography variant="body2" className="mt-1">
                  Coordinates: {loc.coordinates?.coordinates.join(", ")}
                </Typography>

                <Box className="flex gap-2 mt-4">
                  <Button
                    variant="contained"
                    color="primary"
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

      {/* Modal (unchanged except description removed from preview) */}
      {/* ------------------------------- */}
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

    <TextField
      label="Name"
      name="name"
      fullWidth
      margin="dense"
      value={formData.name}
      onChange={handleFormChange}
    />

    <FormControl fullWidth margin="dense">
      <InputLabel>District</InputLabel>
      <Select
        name="district"
        value={formData.district}
        onChange={handleFormChange}
        label="District"
      >
        {districts.map((d) => (
          <MenuItem key={d._id} value={d._id}>
            {d.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

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

    <TextField
      label="Subtitle"
      name="subtitle"
      fullWidth
      margin="dense"
      value={formData.subtitle}
      onChange={handleFormChange}
    />

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
        <MenuItem value="Mountain">Mountain</MenuItem>
        <MenuItem value="Beach">Beach</MenuItem>
        <MenuItem value="Forest">Forest</MenuItem>
        <MenuItem value="Desert">Desert</MenuItem>
        <MenuItem value="Plains">Plains</MenuItem>
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
      value={formData.roadSideAssistant || ""}
      onChange={handleFormChange}
    />

    <TextField
      label="Police Station"
      name="policeStation"
      fullWidth
      margin="dense"
      value={formData.policeStation || ""}
      onChange={handleFormChange}
    />

    <TextField
      label="Ambulance"
      name="ambulance"
      fullWidth
      margin="dense"
      value={formData.ambulance || ""}
      onChange={handleFormChange}
    />

    <TextField
      label="Local Support"
      name="localSupport"
      fullWidth
      margin="dense"
      value={formData.localSupport || ""}
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

    {/* Existing images */}
    {formData.existingImages?.length > 0 && (
      <Box className="flex gap-2 mt-2 flex-wrap">
        {formData.existingImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`existing-${idx}`}
            className="w-20 h-20 object-cover rounded"
          />
        ))}
      </Box>
    )}

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
