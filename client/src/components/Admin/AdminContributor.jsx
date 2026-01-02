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
  Pagination,
} from "@mui/material";
import AddContributionModal from "../AddContributionModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const LIMIT = 9;

const AdminContributor = () => {
  const [contributions, setContributions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContributionId, setEditContributionId] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH CONTRIBUTIONS ================= */
  const fetchContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BACKEND_URL}/contributions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: LIMIT,
          status: filter,
        },
      });

      setContributions(res.data.contributions || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch contributions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [page, filter]);

  /* ================= ACTIONS ================= */
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${BACKEND_URL}/contributions/verify/${id}`,
        { terrain: selected.terrain },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchContributions();
      setSelected(null);
    } catch {
      alert("Failed to approve contribution.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contribution?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/contributions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchContributions();
      setSelected(null);
    } catch {
      alert("Failed to delete contribution.");
    }
  };

  /* ================= STATES ================= */
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

  /* ================= UI ================= */
  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" fontWeight="bold">
          Contributions
        </Typography>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            label="Status"
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* GRID */}
      {contributions.length === 0 ? (
        <Typography>No contributions found.</Typography>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contributions.map((c) => (
            <Card
              key={c._id}
              onClick={() => setSelected(c)}
              className={`cursor-pointer border-t-4 ${
                c.verified ? "border-green-500" : "border-yellow-500"
              }`}
            >
              <CardMedia
                component="img"
                height="160"
                image={c.coverImage || "/defaultCoverPic.png"}
              />
              <CardContent>
                <Typography fontWeight="bold">
                  {c.title || "Untitled"}
                </Typography>
                <Typography variant="body2">
                  District: {c.district || "Unknown"}
                </Typography>
                <Typography variant="caption">
                  {c.verified ? "✅ Approved" : "🕒 Pending"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* MODAL */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <Box className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-3xl mx-auto mt-24 max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              {/* IMAGES */}
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

              {/* BASIC INFO */}
              <Typography variant="h5" fontWeight="bold">
                {selected.title}
              </Typography>

              <Typography className="text-sm text-gray-600">
                District: {selected.district}
              </Typography>

              <Typography className="mt-2">{selected.description}</Typography>

              {/* COORDINATES */}
              <Box className="mt-4 text-sm">
                <Typography>
                  📍 Latitude: {selected.coordinates?.coordinates?.[1]}
                </Typography>
                <Typography>
                  📍 Longitude: {selected.coordinates?.coordinates?.[0]}
                </Typography>
              </Box>

              {/* EXTRA DETAILS */}
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

              {/* RATINGS */}
              {selected.ratings && (
                <Box className="mt-4 border-t pt-3">
                  <Typography variant="h6">Ratings</Typography>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <p>Overall: {selected.ratings.overall}</p>
                    <p>Cleanliness: {selected.ratings.cleanliness}</p>
                    <p>Safety: {selected.ratings.safety}</p>
                    <p>Crowd: {selected.ratings.crowd}</p>
                    <p>Value: {selected.ratings.valueForMoney}</p>
                  </div>
                </Box>
              )}

              {/* TIPS */}
              <Box className="mt-4">
                <Typography variant="h6">Tips</Typography>
                <Typography>{selected.tips || "None"}</Typography>
              </Box>

              {/* TERRAIN */}
              <Box className="mt-4">
                <Typography variant="h6" className="mb-2">
                  Terrain Type
                </Typography>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selected.terrain || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, terrain: e.target.value })
                  }
                >
                  <option value="">Select Terrain</option>
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

              {/* ACTION BUTTONS */}
              <Box className="flex justify-end gap-3 mt-6">
                <Button onClick={() => setSelected(null)}>Close</Button>

                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setEditContributionId(selected._id);

                    setIsEditOpen(true);
                    setSelected(null);
                  }}
                >
                  Edit
                </Button>

                {!selected.verified && (
                  <Button
                    color="success"
                    variant="contained"
                    onClick={() => handleApprove(selected._id)}
                  >
                    Approve
                  </Button>
                )}

                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDelete(selected._id)}
                >
                  Delete
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <AddContributionModal
    isOpen={isEditOpen}
    onClose={() => {
      setIsEditOpen(false);
      setEditContributionId(null);
    }}
    update={true}
    id={editContributionId}
  />;
    </Box>
  );
  
};

export default AdminContributor;
