import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Modal,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminDistricts() {
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    State: "",
    DistrictCode:"",
    image: null,
    existingImage: "",
  });

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  const token = localStorage.getItem("token");

  // ---------------- Fetch Districts ----------------
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`);
        setDistricts(res.data);

        // Extract unique states for dropdown
        const uniqueStates = [...new Set(res.data.map((d) => d.State))];
        setStates(uniqueStates);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  // ---------------- Filter districts by state ----------------
  useEffect(() => {
    if (selectedState) {
      setFilteredDistricts(districts.filter((d) => d.State === selectedState));
    } else {
      setFilteredDistricts(districts);
    }
  }, [selectedState, districts]);

  // ---------------- CRUD Handlers ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this district?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/districts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDistricts(districts.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModalForEdit = (district) => {
    setFormData({
      _id: district._id,
      name: district.name,
      State: district.State,
      DistrictCode:district.DistrictCode || '',
      image: null,
      existingImage: district.imageURL || "",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("State", formData.State);
      data.append("DistrictCode",formData.DistrictCode);
      if (formData.image) data.append("image", formData.image);

      let res;
      if (formData._id) {
        res = await axios.put(`${BACKEND_URL}/districts/${formData._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setDistricts(districts.map((d) => (d._id === formData._id ? res.data : d)));
      } else {
        res = await axios.post(`${BACKEND_URL}/districts`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setDistricts([...districts, res.data]);
      }

      setOpen(false);
      setFormData({ _id: null, name: "", State: "",DistrictCode:"", image: null, existingImage: "" });
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  if (loading) return <Typography className="p-6">Loading districts...</Typography>;

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6 font-bold flex gap-2 ">
        Manage Districts
      </Typography>

      {/* State Filter */}
      <FormControl fullWidth className="mb-4">
        <InputLabel>Select State</InputLabel>
        <Select
          value={selectedState}
          label="Select State"
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <MenuItem value="">All States</MenuItem>
          {states.map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={() => setOpen(true)} className="mb-4">
        + Add New District
      </Button>

      <Grid container spacing={4}>
        {filteredDistricts.map((district) => (
          <Grid item xs={12} sm={6} md={4} key={district._id}>
            <Card className="shadow-md rounded-xl bg-white overflow-hidden">
              {district.imageURL && (
                <img
                  src={district.imageURL}
                  alt={district.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent>
                <Typography variant="h6">{district.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {district.State}
                </Typography>

                <Box className="flex gap-2 mt-4">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => openModalForEdit(district)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(district._id)}
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
            {formData._id ? "Edit District" : "Add New District"}
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
            label="DistrictCode"
            name="DistrictCode"
            fullWidth
            margin="dense"
            value={formData.DistrictCode}
            onChange={handleFormChange}
          />

          {/* State Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>State</InputLabel>
            <Select
              name="State"
              value={formData.State}
              onChange={handleFormChange}
              label="State"
            >
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFormChange}
            className="mt-2"
          />

          {formData.existingImage && (
            <Box className="flex gap-2 mt-2">
              <img
                src={formData.existingImage}
                alt="Existing"
                className="w-24 h-24 object-cover rounded"
              />
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
