import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Modal,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminContributor = () => {
  const [allContributions, setAllContributions] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch all contributions
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/contributions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = Array.isArray(res.data.contributions)
          ? res.data.contributions
          : res.data;

        setAllContributions(list);
        setFilteredContributions(list.filter((c) => !c.verified));
      } catch (err) {
        console.error("Failed to fetch contributions:", err);
        setError("Failed to fetch contributions.");
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, [token]);

  // Apply filter
  useEffect(() => {
    if (filter === "all") setFilteredContributions(allContributions);
    else if (filter === "approved")
      setFilteredContributions(allContributions.filter((c) => c.verified));
    else if (filter === "pending")
      setFilteredContributions(allContributions.filter((c) => !c.verified));
  }, [filter, allContributions]);

  // Approve contribution
  const handleApprove = async (id) => {
  try {
    await axios.put(
      `${BACKEND_URL}/contributions/verify/${id}`,
      { terrain: selected.terrain },   // ⬅ SEND IT
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = allContributions.map((c) =>
      c._id === id
        ? { ...c, verified: true, terrain: selected.terrain }
        : c
    );

    setAllContributions(updated);
    setSelected(null);
  } catch (err) {
    console.error("Approve failed:", err);
    alert("Failed to approve contribution.");
  }
};


  // Delete contribution
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contribution?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/contributions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllContributions(allContributions.filter((c) => c._id !== id));
      setSelected(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete contribution.");
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold">
          Contributions
        </Typography>

        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            label="Status"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Contributions Grid */}
      {filteredContributions.length === 0 ? (
        <Typography>No contributions found.</Typography>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContributions.map((c) => (
            <Card
              key={c._id}
              className={`shadow-md rounded-xl bg-white cursor-pointer hover:shadow-lg transition border-t-4 ${
                c.verified ? "border-green-500" : "border-yellow-500"
              }`}
              onClick={() => setSelected(c)}
            >
              <CardMedia
                component="img"
                height="160"
                image={c.coverImage || "/defaultCoverPic.png"}
                className="rounded-t-xl"
              />

              <CardContent>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  {c.title || "Untitled Place"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  District: {c.district || "Unknown"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="line-clamp-2 mt-2"
                >
                  {c.description}
                </Typography>

                <Typography
                  variant="caption"
                  color={c.verified ? "green" : "orange"}
                  className="mt-2 block"
                >
                  {c.verified ? "✅ Approved" : "🕒 Pending Approval"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <Box className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-3xl mx-auto mt-24 max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              {/* Image gallery */}
              <div className="flex overflow-x-auto gap-3 mb-4">
                {selected.coverImage && (
                  <img
                    src={selected.coverImage}
                    className="h-60 rounded-lg flex-shrink-0"
                  />
                )}
                {selected.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    className="h-60 rounded-lg flex-shrink-0"
                  />
                ))}
              </div>

              <Typography variant="h5" fontWeight="bold">
                {selected.title}
              </Typography>

              <Typography className="text-sm text-gray-600">
                District: {selected.district}
              </Typography>

              <Typography className="mt-4">{selected.description}</Typography>

              {/* Coordinates */}
              <Box className="mt-4">
                <Typography variant="body2">
                  📍 Latitude: {selected.coordinates?.coordinates?.[1]}
                </Typography>
                <Typography variant="body2">
                  📍 Longitude: {selected.coordinates?.coordinates?.[0]}
                </Typography>
              </Box>

              {/* Details */}
              <Box className="mt-4 text-sm text-gray-600">
                <p>🏖 Best Time: {selected.bestTimeToVisit || "N/A"}</p>
                <p>
                  👨‍👩‍👧 Family Friendly: {selected.familyFriendly ? "Yes" : "No"}
                </p>
                <p>🐶 Pet Friendly: {selected.petFriendly ? "Yes" : "No"}</p>
                <p>♿ Accessibility: {selected.accessibility || "N/A"}</p>
                <p>
                  🎯 Activities: {selected.activities?.join(", ") || "None"}
                </p>
              </Box>

              {/* Ratings */}
              {selected.ratings && (
                <div className="mt-4 border-t pt-3">
                  <Typography variant="h6">Ratings</Typography>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                    <p>Overall: {selected.ratings.overall}</p>
                    <p>Cleanliness: {selected.ratings.cleanliness}</p>
                    <p>Safety: {selected.ratings.safety}</p>
                    <p>Crowd: {selected.ratings.crowd}</p>
                    <p>Value for Money: {selected.ratings.valueForMoney}</p>
                  </div>
                </div>
              )}

              {/* Tips */}
              <Box className="mt-4">
                <Typography variant="h6">Tips</Typography>
                <Typography>{selected.tips || "None"}</Typography>
              </Box>
              {/* Terrain Selection */}
              <Box className="mt-4">
                <Typography variant="h6" className="mb-2">
                  Terrain Type
                </Typography>

                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selected?.terrain || "none"}
                  onChange={(e) =>
                    setSelected({ ...selected, terrain: e.target.value })
                  }
                >
                  <option value="none">Select Terrain</option>
                  <option value="Mountain">Mountains</option>
                  <option value="Beach">Beaches</option>
                  <option value="Forest">Forests</option>
                  <option value="Desert">Deserts</option>
                  <option value="Plain">Plains</option>
                  <option value="Rocky">Rocky</option>
                  <option value="River">River</option>
                  <option value="Hilly">Hilly</option>
                  <option value="Urban">Urban</option>
                </select>
              </Box>

              {/* Buttons */}
              <Box className="flex justify-end mt-6 gap-3">
                <Button variant="outlined" onClick={() => setSelected(null)}>
                  Close
                </Button>

                {!selected.verified && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(selected._id)}
                  >
                    Approve
                  </Button>
                )}

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(selected._id)}
                >
                  Delete
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminContributor;
