import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminAnalysis() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/track/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading)
    return (
      <Box className="p-6 flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );

  if (!stats) return <Typography>No data available</Typography>;

  const { overall, byLocation, byDistrict, byUser, topPages, topUsers } = stats;

  return (
    <Box className="p-6 bg-gray-100 min-h-screen space-y-8">
      <Typography variant="h4" className="mb-4 font-bold">
        Page Visit Analytics
      </Typography>

      {/* Overall Stats */}
      <Box className="mb-6">
        <Typography variant="h6" className="font-bold">Overall Stats</Typography>
        <Typography>Total Visits: {overall?.totalVisits || 0}</Typography>
        <Typography>Total Time Spent: {overall?.totalTimeSpent || 0} s</Typography>
        <Typography>Average Time Spent: {overall?.avgTimeSpent?.toFixed(2) || 0} s</Typography>
      </Box>

      {/* Stats by Location */}
      <Box>
        <Typography variant="h6" className="mb-2 font-bold">Visits by Location</Typography>
        <TableContainer component={Paper} className="mb-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>Total Visits</TableCell>
                <TableCell>Total Time Spent (s)</TableCell>
                <TableCell>Average Time Spent (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byLocation.map((loc) => (
                <TableRow key={loc._id}>
                  <TableCell>{loc._id}</TableCell>
                  <TableCell>{loc.totalVisits}</TableCell>
                  <TableCell>{loc.totalTimeSpent}</TableCell>
                  <TableCell>{loc.avgTimeSpent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Stats by District */}
      <Box>
        <Typography variant="h6" className="mb-2 font-bold">Visits by District</Typography>
        <TableContainer component={Paper} className="mb-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>District</TableCell>
                <TableCell>Total Visits</TableCell>
                <TableCell>Total Time Spent (s)</TableCell>
                <TableCell>Average Time Spent (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {byDistrict.map((dist) => (
                <TableRow key={dist._id}>
                  <TableCell>{dist._id}</TableCell>
                  <TableCell>{dist.totalVisits}</TableCell>
                  <TableCell>{dist.totalTimeSpent}</TableCell>
                  <TableCell>{dist.avgTimeSpent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Top Pages */}
      <Box>
        <Typography variant="h6" className="mb-2 font-bold">Top Pages</Typography>
        <TableContainer component={Paper} className="mb-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Page</TableCell>
                <TableCell>Total Visits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topPages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell>{page._id}</TableCell>
                  <TableCell>{page.totalVisits}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Top Users */}
      <Box>
        <Typography variant="h6" className="mb-2 font-bold">Top Users</Typography>
        <TableContainer component={Paper} className="mb-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Total Visits</TableCell>
                <TableCell>Total Time Spent (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id || "Anonymous"}</TableCell>
                  <TableCell>{user.totalVisits}</TableCell>
                  <TableCell>{user.totalTimeSpent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
