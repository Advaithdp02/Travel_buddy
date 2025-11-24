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
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Modal & Form
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    state: "",
    district: "",
    location: "",
    locationId: "",
    longitude: "",
    latitude: "",
    mapLink: "",
    images: [],
    existingImages: [],
  });

  const token = localStorage.getItem("token");

  // ---------------- FETCH HOTELS + FILTERS + PAGINATION ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page,
          limit,
          districtId: selectedDistrict || "",
          state: selectedState || "",
        });

        const hotelsRes = await axios.get(
          `${BACKEND_URL}/hotels?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const districtsRes = await axios.get(`${BACKEND_URL}/districts`);
        const locationsRes = await axios.get(`${BACKEND_URL}/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHotels(hotelsRes.data.hotels);
        setTotalPages(hotelsRes.data.totalPages);

        setDistricts(districtsRes.data);
        setLocations(locationsRes.data);

        const uniqueStates = [...new Set(districtsRes.data.map((d) => d.State))];
        setStates(uniqueStates);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedState, selectedDistrict, token, limit]);

  // ---------------- FILTERED DISTRICTS ----------------
  const filteredDistricts = districts.filter(
    (d) => !selectedState || d.State === selectedState
  );

  // ---------------- CRUD: DELETE HOTEL ----------------
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

  // ---------------- FORM CHANGE HANDLER ----------------
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, images: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ---------------- OPEN EDIT MODAL ----------------
  const openModalForEdit = (hotel) => {
    setFormData({
      _id: hotel._id,
      name: hotel.name,
      state: hotel.district?.State || "",
      district: hotel.district?._id || "",
      location: hotel.location,
      locationId: hotel.locationId?._id || "",
      longitude: hotel.coordinates?.coordinates[0] || "",
      latitude: hotel.coordinates?.coordinates[1] || "",
      mapLink: hotel.coordinates?.link || "",
      images: [],
      existingImages: hotel.img ? [hotel.img] : [],
    });
    setOpen(true);
  };

  // ---------------- SUBMIT FORM (CREATE/UPDATE) ----------------
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
          link: formData.mapLink,
        })
      );

      if (formData.images?.length > 0) {
        for (const file of formData.images) data.append("images", file);
      }

      let res;
      if (formData._id) {
        res = await axios.put(
          `${BACKEND_URL}/hotels/${formData._id}`,
          data,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );

        setHotels(hotels.map((h) => (h._id === formData._id ? res.data : h)));
      } else {
        res = await axios.post(`${BACKEND_URL}/hotels`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        setHotels([...hotels, res.data]);
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      name: "",
      state: "",
      district: "",
      location: "",
      locationId: "",
      longitude: "",
      latitude: "",
      mapLink: "",
      images: [],
      existingImages: [],
    });
  };

  if (loading) return <Typography className="p-6">Loading hotels...</Typography>;

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6 font-bold">Manage Hotels</Typography>

      {/* ---------------- FILTERS ---------------- */}
      <Box className="flex gap-4 mb-4">
        <FormControl fullWidth margin="dense">
          <InputLabel>State</InputLabel>
          <Select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict("");
              setPage(1);
            }}
            label="State"
          >
            <MenuItem value="">All States</MenuItem>
            {states.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>District</InputLabel>
          <Select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setPage(1);
            }}
            label="District"
          >
            <MenuItem value="">All Districts</MenuItem>
            {filteredDistricts.map((d) => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Hotel
        </Button>
      </Box>

      {/* ---------------- HOTELS GRID ---------------- */}
      <Grid container spacing={4}>
        {hotels.map((hotel) => (
          <Grid item key={hotel._id} xs={12} sm={6} md={4}>
            <Card
  className="shadow-md rounded-xl overflow-hidden flex flex-col"
  sx={{ width: 420 }}     // ⭐ FIXED CARD HEIGHT
>

  

  {/* CONTENT */}
  <CardContent
    sx={{
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      paddingBottom: "16px !important",
    }}
  >
    {/* CONTENT WRAPPER WITH FIXED HEIGHT */}
    <Box sx={{ height: 140, overflow: "hidden" }}>
      <Typography variant="h6" className="mb-1">
        {hotel.name}
      </Typography>

      <Typography variant="body2">
        District: {hotel.district?.name || "N/A"}
      </Typography>

      {/* ⭐ 2-LINE CLAMP */}
      <Typography
        variant="body2"
        
      >
        {hotel.location}
      </Typography>

      {/* Coordinates */}
      {hotel.coordinates && (
        <Typography variant="body2" sx={{ marginTop: "4px" }}>
          {hotel.coordinates.coordinates.join(", ")}
        </Typography>
      )}

      {/* Map Link */}
      {hotel.coordinates?.link && (
        <Typography variant="body2" sx={{ marginTop: "4px", color: "blue" }}>
          <a href={hotel.coordinates.link} target="_blank">
            View on Map
          </a>
        </Typography>
      )}
    </Box>

    {/* ACTION BUTTONS FIXED AT BOTTOM */}
    <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
      <Button
        variant="contained"
        fullWidth
        onClick={() => openModalForEdit(hotel)}
      >
        Edit
      </Button>

      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={() => handleDelete(hotel._id)}
      >
        Delete
      </Button>
    </Box>
  </CardContent>
</Card>

          </Grid>
        ))}
      </Grid>

      {/* ---------------- PAGINATION CONTROLS ---------------- */}
      <Box className="flex justify-center mt-8 gap-4">
        <Button variant="outlined" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>

        <Typography variant="body1" className="flex items-center">
          Page {page} of {totalPages}
        </Typography>

        <Button variant="outlined" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Box>

      {/* ---------------- MODAL (ADD/EDIT) ---------------- */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="absolute top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg">
          <Typography variant="h6" className="mb-4 font-bold">
            {formData._id ? "Edit Hotel" : "Add New Hotel"}
          </Typography>

          <TextField label="Name" name="name" fullWidth margin="dense" value={formData.name} onChange={handleFormChange} />
          <TextField label="Location (Address)" name="location" fullWidth margin="dense" value={formData.location} onChange={handleFormChange} />

          <FormControl fullWidth margin="dense">
            <InputLabel>State</InputLabel>
            <Select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value, district: "" })}
            >
              <MenuItem value="">Select State</MenuItem>
              {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>District</InputLabel>
            <Select name="district" value={formData.district} onChange={handleFormChange}>
              <MenuItem value="">Select District</MenuItem>
              {districts
                .filter((d) => !formData.state || d.State === formData.state)
                .map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Location ID</InputLabel>
            <Select name="locationId" value={formData.locationId} onChange={handleFormChange}>
              <MenuItem value="">None</MenuItem>
              {locations.map((l) => (
                <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box className="flex gap-2 mt-2">
            <TextField label="Longitude" name="longitude" fullWidth value={formData.longitude} onChange={handleFormChange} />
            <TextField label="Latitude" name="latitude" fullWidth value={formData.latitude} onChange={handleFormChange} />
          </Box>

          <TextField label="Google Maps Link" name="mapLink" fullWidth margin="dense" value={formData.mapLink} onChange={handleFormChange} />

          <input type="file" name="images" multiple onChange={handleFormChange} className="mt-2" />

          {formData.existingImages.length > 0 && (
            <Box className="flex gap-2 mt-2 flex-wrap">
              {formData.existingImages.map((img, idx) => (
                <img key={idx} src={img} alt="old" className="w-20 h-20 object-cover rounded" />
              ))}
            </Box>
          )}

          <Box className="flex justify-end mt-4 gap-2">
            <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {formData._id ? "Update" : "Save"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
