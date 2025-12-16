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

  const token = localStorage.getItem("token");

  /* ================= FETCH (SERVER-SIDE PAGINATION) ================= */
  const fetchContributions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BACKEND_URL}/contributions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: LIMIT,
          status: filter, // pending | approved | all
        },
      });

      /**
       * Expected backend response (later):
       * {
       *   contributions: [],
       *   totalPages: number,
       *   currentPage: number
       * }
       */

      const data = res.data.contributions || res.data;

      setContributions(data);
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
              setPage(1); // reset page on filter change
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
        <Box className="bg-white p-6 w-[90%] max-w-3xl mx-auto mt-24 rounded-xl">
          {selected && (
            <>
              <Typography variant="h5" fontWeight="bold">
                {selected.title}
              </Typography>

              <Typography className="mt-2">
                {selected.description}
              </Typography>

              <Box className="mt-4">
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={selected.terrain || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, terrain: e.target.value })
                  }
                >
                  <option value="">Select Terrain</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Beach">Beach</option>
                  <option value="Forest">Forest</option>
                  <option value="Desert">Desert</option>
                  <option value="Urban">Urban</option>
                </select>
              </Box>

              <Box className="flex justify-end gap-3 mt-6">
                <Button onClick={() => setSelected(null)}>Close</Button>

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
    </Box>
  );
};

export default AdminContributor;
