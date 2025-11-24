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
  const [expandedReplies, setExpandedReplies] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalComment, setModalComment] = useState(null);

  const token = localStorage.getItem("token");

  // ================================
  // FETCH DISTRICTS
  // ================================
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDistricts(res.data);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };
    fetchDistricts();
  }, [token]);

  // ================================
  // FETCH LOCATIONS FOR DISTRICT
  // ================================
  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedDistrict) {
        setLocations([]);
        return;
      }

      try {
        const res = await axios.get(
          `${BACKEND_URL}/locations/district/${selectedDistrict}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLocations(res.data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchLocations();
  }, [selectedDistrict, token]);

  // ================================
  // FETCH COMMENTS WITH PAGINATION
  // ================================
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (selectedDistrict) params.append("districtId", selectedDistrict);
        if (selectedLocation) params.append("locationId", selectedLocation);

        params.append("page", page);
        params.append("limit", limit);

        const res = await axios.get(
          `${BACKEND_URL}/comments?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setComments(res.data.comments);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        setError("Failed to fetch comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [selectedDistrict, selectedLocation, page, token, limit]);

  // ================================
  // DELETE COMMENT
  // ================================
  const handleDeleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prev) => prev.filter((c) => c._id !== id));
      if (modalComment?._id === id) setModalComment(null);
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };
  const toggleReplyExpand = (replyId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }));
  };

  // ================================
  // DELETE REPLY
  // ================================
  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/comments/reply/${commentId}/${replyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update modal instantly
      setModalComment((prev) => ({
        ...prev,
        replies: prev.replies.filter((r) => r._id !== replyId),
      }));

      // Update comments list
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        )
      );
    } catch (err) {
      alert("Failed to delete reply.");
    }
  };

  // ================================
  // LOADING / ERROR STATES
  // ================================
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

  // ================================
  // MAIN RENDER
  // ================================
  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="font-bold mb-6">
        Comments Management
      </Typography>

      {/* ================= FILTERS ================= */}
      <Box className="flex gap-4 mb-6 flex-wrap">
        {/* District */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>District</InputLabel>
          <Select
            value={selectedDistrict}
            label="District"
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedLocation("");
              setPage(1);
            }}
          >
            <MenuItem value="">All Districts</MenuItem>
            {districts.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Location */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Location</InputLabel>
          <Select
            value={selectedLocation}
            label="Location"
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setPage(1);
            }}
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

      {/* ================= COMMENTS GRID ================= */}
      {comments.length === 0 ? (
        <Typography>No comments found.</Typography>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {comments.map((c) => (
            <Card key={c._id} className="shadow-md rounded-xl bg-white">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {c.location?.name || "Unknown Location"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  By {c.user?.name || "Anonymous"}
                </Typography>

                <Typography
                  variant="body2"
                  className="line-clamp-3 mt-2 cursor-pointer"
                  onClick={() => setModalComment(c)}
                >
                  {c.text}
                </Typography>

                <Box className="flex justify-between mt-4">
                  <Typography variant="caption">
                    Likes: {c.likes?.length || 0}
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteComment(c._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      <Box className="flex justify-center mt-8 gap-4">
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <Typography variant="body1" className="flex items-center">
          Page {page} of {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </Box>

      {/* ================= MODAL ================= */}
      <Modal open={!!modalComment} onClose={() => setModalComment(null)}>
        <Box className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-3xl mx-auto mt-24 overflow-y-auto max-h-[80vh]">
          {modalComment && (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Comment by {modalComment.user?.name || "Anonymous"}
                <br />
                <span className="text-gray-500 text-sm">
                  on {modalComment.location?.name || "Unknown Location"}
                </span>
              </Typography>

              <Typography className="mb-4">{modalComment.text}</Typography>

              {/* -------- Replies Section -------- */}
              {modalComment.replies?.length > 0 && (
                <Box className="mt-6">
                  <Typography fontWeight="bold" gutterBottom>
                    Replies
                  </Typography>

                  {/* Scrollable replies container */}
                  <Box
                    className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                    sx={{ maxHeight: 250, overflowY: "auto" }}
                  >
                    {modalComment.replies.map((r) => {
                      const textLimit = 120;
                      const isLong = r.text.length > textLimit;
                      const expanded = expandedReplies[r._id] || false;

                      return (
                        <Box
                          key={r._id}
                          className="p-3 mb-3 rounded-lg bg-white border border-gray-200"
                        >
                          <Box className="flex justify-between items-center mb-1">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {r.user?.name || "Anonymous"}
                            </Typography>

                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteReply(modalComment._id, r._id)
                              }
                            >
                              Delete
                            </Button>
                          </Box>

                          {/* Reply text with View More / View Less */}
                          <Typography variant="body2">
                            {expanded || !isLong
                              ? r.text
                              : r.text.substring(0, textLimit) + "..."}
                          </Typography>

                          {isLong && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => toggleReplyExpand(r._id)}
                            >
                              {expanded ? "View Less" : "View More"}
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Box className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outlined"
                  onClick={() => setModalComment(null)}
                >
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
