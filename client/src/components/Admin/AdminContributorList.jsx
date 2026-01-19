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
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminContributor() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <Card key={user.userId} className="shadow-md rounded-xl bg-white">
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
    </Box>
  );
}
