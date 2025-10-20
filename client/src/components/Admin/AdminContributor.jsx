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
  const [filter, setFilter] = useState("pending"); // default: Pending
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

        setAllContributions(res.data);
        setFilteredContributions(res.data.filter((c) => !c.verified));
      } catch (err) {
        console.error("Failed to fetch contributions:", err);
        setError("Failed to fetch contributions.");
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, [token]);

  // Filter contributions
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
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = allContributions.map((c) =>
        c._id === id ? { ...c, verified: true } : c
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

      const updated = allContributions.filter((c) => c._id !== id);
      setAllContributions(updated);
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

        {/* Dropdown Filter */}
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

      {filteredContributions.length === 0 ? (
        <Typography>No contributions found for this filter.</Typography>
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
              {c.coverImage && (
                <CardMedia
                  component="img"
                  height="160"
                  image={c.coverImage}
                  alt={c.description?.slice(0, 20) || "Contribution"}
                  className="rounded-t-xl"
                />
              )}
              <CardContent>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  {c.location?.name || "Unknown Location"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  By: {c.user?.name || "Anonymous"}
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
                  {c.verified ? "✅ Approved" : "🕒 Pending"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for details */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <Box className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-3xl mx-auto mt-24 overflow-y-auto max-h-[80vh]">
          {selected && (
            <>
              {selected.coverImage && (
                <img
                  src={selected.coverImage}
                  alt="Cover"
                  className="w-full h-[300px] object-cover rounded-lg mb-4"
                />
              )}
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {selected.location?.name || "Unknown Location"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                By: {selected.user?.name || "Anonymous"}
              </Typography>

              <Typography className="mt-3">{selected.description}</Typography>

              <Box className="mt-4 text-sm text-gray-600">
                <p>🏖️ Best time: {selected.bestTimeToVisit || "N/A"}</p>
                <p>👨‍👩‍👧 Family Friendly: {selected.familyFriendly ? "Yes" : "No"}</p>
                <p>🐶 Pet Friendly: {selected.petFriendly ? "Yes" : "No"}</p>
                <p>♿ Accessibility: {selected.accessibility || "N/A"}</p>
                <p>🎯 Activities: {selected.activities?.join(", ") || "None"}</p>

                {/* Ratings */}
                {selected?.ratings && (
                  <div className="mt-4 border-t border-gray-200 pt-3">
                    <h4 className="font-semibold text-lg mb-2 text-gray-800">
                      Ratings
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 text-sm text-gray-700">
                      <p>
                        <strong>Overall:</strong>{" "}
                        {selected.ratings.overall ?? "N/A"}
                      </p>
                      <p>
                        <strong>Cleanliness:</strong>{" "}
                        {selected.ratings.cleanliness ?? "N/A"}
                      </p>
                      <p>
                        <strong>Safety:</strong>{" "}
                        {selected.ratings.safety ?? "N/A"}
                      </p>
                      <p>
                        <strong>Crowd:</strong>{" "}
                        {selected.ratings.crowd ?? "N/A"}
                      </p>
                      <p>
                        <strong>Value for Money:</strong>{" "}
                        {selected.ratings.valueForMoney ?? "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </Box>

              <Box className="flex justify-end gap-3 mt-6">
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
