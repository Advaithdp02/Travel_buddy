import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Divider,
} from "@mui/material";



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminContributor() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [places, setPlaces] = useState([]);
const [loadingPlaces, setLoadingPlaces] = useState(false);


  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${BACKEND_URL}/services/top?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setContributors(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Contributor fetch error:", err);
        setError("Failed to load contributors.");
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [page, token]);
const handleOpenUser = async (user) => {
  setSelectedUser(user);
  setOpen(true);
  setLoadingPlaces(true);

  try {
    const res = await axios.get(
      `${BACKEND_URL}/contributions/staff/${user.userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPlaces(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingPlaces(false);
  }
};
const groupByDate = (places) => {
  return places.reduce((acc, place) => {
    const date = new Date(place.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!acc[date]) acc[date] = [];
    acc[date].push(place);

    return acc;
  }, {});
};


  // ---------------- UI ----------------

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
    <Box className="p-6 bg-gray-100 min-h-screen space-y-6">
      <Typography variant="h4" className="font-bold">
        Contributors Leaderboard
      </Typography>

      {/* Contributors List */}
      <div className="grid gap-4">
        {contributors.map((user, index) => (
          <Card
  key={user.userId}
  className="shadow-md rounded-xl bg-white cursor-pointer hover:shadow-lg transition"
  onClick={() => handleOpenUser(user)}
>
            <CardContent className="flex justify-between items-center">
              <Box>
                <Typography variant="h6">
                  #{(page - 1) * limit + index + 1} — {user.name}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>

              <Box className="text-right">
                <Typography
                  variant="h6"
                  className="text-indigo-600 font-semibold"
                >
                  {user.totalContributions}
                </Typography>
                <Typography variant="caption">
                  Contributions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Box className="flex justify-center items-center gap-4 mt-6">
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        <Typography>
          Page {page} of {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
  <DialogTitle>
    {selectedUser?.name}'s Contributions
  </DialogTitle>

  <DialogContent>
  {loadingPlaces ? (
    <Box className="flex justify-center py-6">
      <CircularProgress />
    </Box>
  ) : places.length === 0 ? (
    <Typography>No contributions yet.</Typography>
  ) : (
    (() => {
      const grouped = groupByDate(places);

      return Object.entries(grouped).map(([date, items]) => (
        <Box key={date} className="mb-6">
          {/* Date Header */}
          <Box className="flex justify-between items-center mb-2">
            <Typography variant="h6" className="font-semibold">
              📅 {date}
            </Typography>

            <Typography variant="body2" color="textSecondary">
              {items.length} place{items.length > 1 ? "s" : ""}
            </Typography>
          </Box>

          {/* Places */}
          <div className="space-y-3">
            {items.map((place) => (
              <Box
                key={place._id}
                className={`p-4 rounded-lg border-l-4 ${
                  place.verified
                    ? "border-green-500 bg-green-50"
                    : "border-yellow-400 bg-yellow-50"
                }`}
              >
                <Typography className="font-semibold">
                  {place.title}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  {place.district}
                </Typography>

                <Box className="mt-2 flex gap-2 items-center">
                  <Chip
                    label={place.verified ? "Approved" : "Pending"}
                    color={place.verified ? "success" : "warning"}
                    size="small"
                  />

                  <Typography variant="caption" color="textSecondary">
                    {new Date(place.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </div>
        </Box>
      ));
    })()
  )}
</DialogContent>

</Dialog>

    </Box>

  );
}
