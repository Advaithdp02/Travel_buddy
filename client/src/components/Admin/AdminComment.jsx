import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Modal,
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminComment = () => {
  const [comments, setComments] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalComment, setModalComment] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch districts for filter
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDistricts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistricts();
  }, [token]);

  // Fetch locations when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setLocations([]);
      return;
    }
    const fetchLocations = async () => {
      try {
        console.log("Fetching locations for district:", selectedDistrict);
        const res = await axios.get(
          `${BACKEND_URL}/locations/district/${selectedDistrict}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLocations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, [selectedDistrict, token]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        let url = `${BACKEND_URL}/comments`;
        if (selectedLocation) url += `?location=${selectedLocation}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch comments.");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [selectedLocation, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete comment.");
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
      <Typography variant="h4" className="font-bold mb-6">
        Comments Management
      </Typography>

      {/* Filters */}
      <Box className="flex gap-4 mb-6 flex-wrap">
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>District</InputLabel>
          <Select
            value={selectedDistrict}
            label="District"
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedLocation("");
            }}
          >
            <MenuItem value="">All Districts</MenuItem>
            {districts.map((d) => (
              <MenuItem key={d._id} value={d.name}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Location</InputLabel>
          <Select
            value={selectedLocation}
            label="Location"
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map((l) => (
              <MenuItem key={l._id} value={l._id}>
                {l.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Typography>No comments found.</Typography>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {comments.map((c) => (
            <Card key={c._id} className="shadow-md rounded-xl bg-white cursor-pointer hover:shadow-lg transition">
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
                  className="line-clamp-3 mt-2"
                  onClick={() => setModalComment(c)}
                >
                  {c.text}
                </Typography>
                <Box className="flex justify-between mt-4">
                  <Typography variant="caption">Likes: {c.likes?.length || 0}</Typography>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(c._id)}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for comment details */}
      <Modal open={!!modalComment} onClose={() => setModalComment(null)}>
        <Box className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-3xl mx-auto mt-24 overflow-y-auto max-h-[80vh]">
          {modalComment && (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Comment by {modalComment.user?.name || "Anonymous"} on {modalComment.location?.name || "Unknown Location"}
              </Typography>
              <Typography className="mb-4">{modalComment.text}</Typography>

              {modalComment.replies?.length > 0 && (
                <Box>
                  <Typography fontWeight="bold" gutterBottom>Replies</Typography>
                  {modalComment.replies.map((r, idx) => (
                    <Box key={idx} className="pl-4 mb-2 border-l border-gray-300">
                      <Typography variant="body2" fontWeight="bold">{r.user?.name || "Anonymous"}</Typography>
                      <Typography variant="body2">{r.text}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Box className="flex justify-end gap-3 mt-6">
                <Button variant="outlined" onClick={() => setModalComment(null)}>
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminComment;
