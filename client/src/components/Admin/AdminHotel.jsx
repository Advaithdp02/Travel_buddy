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

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & form state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    location: "",
    district: "",
    locationId: "",
    longitude: "",
    latitude: "",
    images: [],
    existingImages: [],
  });

  const token = localStorage.getItem("token");

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsRes, districtsRes, locationsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/hotels`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BACKEND_URL}/districts`),
          axios.get(`${BACKEND_URL}/locations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setHotels(hotelsRes.data);
        setDistricts(districtsRes.data);
        setLocations(locationsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // ---------------- CRUD Handlers ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(hotels.filter((h) => h._id !== id));
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

  const openModalForEdit = (hotel) => {
    setFormData({
      _id: hotel._id,
      name: hotel.name,
      location: hotel.location,
      district: hotel.district?._id || "",
      locationId: hotel.locationId?._id || "",
      longitude: hotel.coordinates?.coordinates[0] || "",
      latitude: hotel.coordinates?.coordinates[1] || "",
      images: [],
      existingImages: hotel.img ? [hotel.img] : [],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("district", formData.district);
      data.append("locationId", formData.locationId);
      data.append(
        "coordinates",
        JSON.stringify({
          type: "Point",
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        })
      );

      if (formData.images?.length > 0) {
        for (const file of formData.images) {
          data.append("images", file);
        }
      }

      let res;
      if (formData._id) {
        res = await axios.put(`${BACKEND_URL}/hotels/${formData._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setHotels(hotels.map((h) => (h._id === formData._id ? res.data : h)));
      } else {
        res = await axios.post(`${BACKEND_URL}/hotels`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setHotels([...hotels, res.data]);
      }

      setOpen(false);
      setFormData({
        _id: null,
        name: "",
        location: "",
        district: "",
        locationId: "",
        longitude: "",
        latitude: "",
        images: [],
        existingImages: [],
      });
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  if (loading) return <Typography className="p-6">Loading hotels...</Typography>;

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6 font-bold">
        Manage Hotels
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} className="mb-4">
        + Add New Hotel
      </Button>

      <Grid container spacing={4}>
        {hotels.map((hotel) => (
          <Grid item xs={12} sm={6} md={4} key={hotel._id}>
            <Card className="shadow-md rounded-xl bg-white overflow-hidden">
              {hotel.img && (
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent>
                <Typography variant="h6">{hotel.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  District: {hotel.district?.name || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Location: {hotel.location}
                </Typography>
                {hotel.coordinates && (
                  <Typography variant="body2">
                    Coordinates: {hotel.coordinates.coordinates.join(", ")}
                  </Typography>
                )}

                <Box className="flex gap-2 mt-4">
                  <Button variant="contained" color="primary" onClick={() => openModalForEdit(hotel)}>
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(hotel._id)}>
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
            {formData._id ? "Edit Hotel" : "Add New Hotel"}
          </Typography>

          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={handleFormChange}
          />

          <TextField
            label="Location (Address)"
            name="location"
            fullWidth
            margin="dense"
            value={formData.location}
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

          <FormControl fullWidth margin="dense">
            <InputLabel>Location ID (Optional)</InputLabel>
            <Select
              name="locationId"
              value={formData.locationId}
              onChange={handleFormChange}
              label="Location"
            >
              <MenuItem value="">None</MenuItem>
              {locations.map((l) => (
                <MenuItem key={l._id} value={l._id}>
                  {l.name}
                </MenuItem>
              ))}
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

          <input type="file" name="images" multiple onChange={handleFormChange} className="mt-2" />

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
