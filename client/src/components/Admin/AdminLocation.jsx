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

  // Modal & form state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    terrain:"",
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

  // ---------------- Fetch Data ----------------
  useEffect(() => {
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
      terrain:loc.terrain,
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
      data.append("terrain",formData.terrain);
      data.append("district", formData.district);
      data.append("description", formData.description);
      data.append(
        "coordinates",
        JSON.stringify([parseFloat(formData.longitude), parseFloat(formData.latitude)])
      );
      data.append("subtitle", formData.subtitle);
      const pointsArray = formData.points.split(',').map(p => p.trim()); // split string into array and remove extra spaces

      pointsArray.forEach(point => {
        data.append("points", point);
      });


      if (formData.images?.length > 0) {
        for (const file of formData.images) {
          data.append("images", file);
        }
      }

      let res;
      if (formData._id) {
        // Update existing location
        res = await axios.put(`${BACKEND_URL}/locations/${formData._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setLocations(
          locations.map((loc) => (loc._id === formData._id ? res.data : loc))
        );
      } else {
        // Create new location
        res = await axios.post(`${BACKEND_URL}/locations`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setLocations([...locations, res.data]);
      }

      setOpen(false);
      setFormData({
        _id: null,
        name: "",
        district: "",
        description: "",
        longitude: "",
        latitude: "",
        images: [],
        terrain:"",
        existingImages: [],
      });
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  if (loading) return <Typography className="p-6">Loading locations...</Typography>;

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6 font-bold">
        Manage Locations
      </Typography>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        className="mb-4"
      >
        + Add New Location
      </Button>

      <Grid container spacing={4}>
        {locations.map((loc) => (
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
                  {loc.description}
                </Typography>
                {loc.coordinates && (
                  <Typography variant="body2" className="mt-1">
                    Coordinates: {loc.coordinates.coordinates.join(", ")}
                  </Typography>
                )}

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

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="absolute top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg">
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
            multiline
            minRows={3}
            value={formData.subtitle}
            onChange={handleFormChange}
          />
          <TextField
            label="Points(seperated with commas)"
            name="points"
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            value={formData.points}
            onChange={handleFormChange}
          />
           <FormControl fullWidth margin="dense">
            <InputLabel>Terrain</InputLabel>
            <Select
              name="terrain"
              value={formData.terrain}
              onChange={handleFormChange}
              label="terrain"
            >
              
                <MenuItem key="Mountain" value="Mountain">
                  Mountains</MenuItem>
          <MenuItem key="Beach" value="Beach">Beaches</MenuItem>
          <MenuItem key="Forest" value="Forest">Forests</MenuItem>
          <MenuItem key="Desert" value="Desert">Deserts</MenuItem>
          <MenuItem key="Plains" value="Plains">Plains</MenuItem>
                
              
            </Select>
          </FormControl>
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

          <input
            type="file"
            name="images"
            multiple
            onChange={handleFormChange}
            className="mt-2"
          />

          {/* Show existing images */}
          {formData.existingImages.length > 0 && (
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
