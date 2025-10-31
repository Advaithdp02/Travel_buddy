import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminAnalysis() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [locationStats, setLocationStats] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // --- Fetch user-level stats ---
  useEffect(() => {
    if (tabValue !== 0) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/track/user-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const formatted = res.data.data.map((item, index) => ({
            id: index + 1,
            username: item.username || "Anonymous",
            totalVisits: item.totalVisits,
            totalTimeSpent: item.totalTimeSpent,
            uniqueLocations: item.uniqueLocations.join(", "),
            uniqueDistricts: item.uniqueDistricts.join(", "),
            userId: item.user, // for fetching details
          }));
          setRows(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, tabValue]);

  // --- Fetch location-level stats ---
  useEffect(() => {
    if (tabValue !== 1) return;
    const fetchLocationStats = async () => {
      try {
        setLocLoading(true);
        const res = await axios.get(`${BACKEND_URL}/track/location-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const formatted = res.data.data.map((loc, index) => ({
            id: index + 1,
            location: loc.location,
            totalVisits: loc.totalVisits,
            uniqueUsers: loc.uniqueUsersCount,
            totalTimeSpent: loc.totalTimeSpent,
            avgTimeSpent: loc.avgTimeSpent.toFixed(2),
          }));
          setLocationStats(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch location stats:", err);
      } finally {
        setLocLoading(false);
      }
    };
    fetchLocationStats();
  }, [token, tabValue]);

  // --- Fetch per-user details ---
  const handleViewDetails = async (userId, username) => {
    setSelectedUser({ id: userId, name: username });
    setDetailsLoading(true);
    setModalOpen(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/track/user-details/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUserDetails(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // --- Columns ---
  const userColumns = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "uniqueLocations", headerName: "Visited Locations", flex: 2 },
    { field: "uniqueDistricts", headerName: "Visited Districts", flex: 2 },
    { field: "totalVisits", headerName: "Total Visits", flex: 1 },
    { field: "totalTimeSpent", headerName: "Total Time (s)", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleViewDetails(params.row.userId, params.row.username)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const locationColumns = [
    { field: "location", headerName: "Location", flex: 2 },
    { field: "totalVisits", headerName: "Total Visits", flex: 1 },
    { field: "uniqueUsers", headerName: "Unique Users", flex: 1 },
    { field: "totalTimeSpent", headerName: "Total Time (s)", flex: 1 },
    { field: "avgTimeSpent", headerName: "Avg Time (s)", flex: 1 },
  ];

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  return (
    <Box className="p-6 bg-gray-100 min-h-screen space-y-8">
      <Typography variant="h4" className="font-bold mb-4">
        Analytics Dashboard
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="User Visit Analytics" />
        <Tab label="Location Analytics" />
      </Tabs>

      {/* USER TAB */}
      {tabValue === 0 && (
        loading ? (
          <Box className="flex justify-center items-center h-[60vh]">
            <CircularProgress />
          </Box>
        ) : (
          <Paper style={{ height: 650, width: "100%", padding: "1rem" }}>
            <DataGrid
              rows={rows}
              columns={userColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              components={{ Toolbar: GridToolbar }}
            />
          </Paper>
        )
      )}

      {/* LOCATION TAB */}
      {tabValue === 1 && (
        locLoading ? (
          <Box className="flex justify-center items-center h-[60vh]">
            <CircularProgress />
          </Box>
        ) : (
          <Paper style={{ height: 650, width: "100%", padding: "1rem" }}>
            <DataGrid
              rows={locationStats}
              columns={locationColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              components={{ Toolbar: GridToolbar }}
            />
          </Paper>
        )
      )}

      {/* MODAL FOR USER DETAILS */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            width: "80%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" className="mb-4 font-semibold">
            User Details —{" "}
            {selectedUser?.name === "Anonymous"
              ? "Anonymous"
              : selectedUser?.name || "Unknown"}
          </Typography>

          {detailsLoading ? (
            <Box className="flex justify-center items-center h-[50vh]">
              <CircularProgress />
            </Box>
          ) : userDetails.length === 0 ? (
            <Typography>No data found for this user.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Visited At</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>District</TableCell>
                    <TableCell>Time Spent (s)</TableCell>
                    <TableCell>Exit Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userDetails.map((visit, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {new Date(visit.visitedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{visit.location}</TableCell>
                      <TableCell>{visit.district}</TableCell>
                      <TableCell>{visit.timeSpent}</TableCell>
                      <TableCell>{visit.exitReason || "Unknown"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
