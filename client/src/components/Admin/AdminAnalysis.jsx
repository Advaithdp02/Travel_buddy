import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Modal,
  Tabs,
  Tab,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminAnalysis() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [locationStats, setLocationStats] = useState([]);
  const [locLoading, setLocLoading] = useState(false);

  const [fromDate, setFromDate] = useState(dayjs().subtract(1, "month"));
  const [toDate, setToDate] = useState(dayjs());

  const [preset, setPreset] = useState("1m");
  const [openModal, setOpenModal] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
// Hotel analytics state
const [hotelStats, setHotelStats] = useState([]);
const [hotelLoading, setHotelLoading] = useState(false);

const [openHotelModal, setOpenHotelModal] = useState(false);
const [selectedHotel, setSelectedHotel] = useState(null);
const [hotelDetails, setHotelDetails] = useState([]);
const [hotelDetailsLoading, setHotelDetailsLoading] = useState(false);


// --- Add new state ---
const [userDetails, setUserDetails] = useState([]);
const [userLoading, setUserLoading] = useState(false);
const [openLocationModal, setOpenLocationModal] = useState(false);
const [selectedLocation, setSelectedLocation] = useState(null);
const [locationDetails, setLocationDetails] = useState([]);
const [locationLoading, setLocationLoading] = useState(false);

const handleOpenLocationModal = async (location) => {
  setSelectedLocation(location);
  setOpenLocationModal(true);
  setLocationLoading(true);
  try {
    const res = await axios.get(`${BACKEND_URL}/track/location-details/${location}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.success) setLocationDetails(res.data.data);
  } catch (err) {
    console.error("Error fetching location details:", err);
  } finally {
    setLocationLoading(false);
  }
};

const handleOpenHotelModal = async (hotel) => {
  setSelectedHotel(hotel);
  setOpenHotelModal(true);
  setHotelDetailsLoading(true);
  try {
    const res = await axios.get(`${BACKEND_URL}/track/hotel-details/${hotel.hotelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.success) setHotelDetails(res.data.data);
  } catch (err) {
    console.error("Error fetching hotel details:", err);
  } finally {
    setHotelDetailsLoading(false);
  }
};

const handleCloseLocationModal = () => {
  setOpenLocationModal(false);
  setSelectedLocation(null);
};


// --- Modified handler ---
const handleViewDetails = async (user) => {
  setSelectedUser(user);
  setUserDetails([]);
  setOpenModal(true);
  setUserLoading(true);

  try {
    const res = await axios.get(
      `${BACKEND_URL}/track/user-details/${user.userId || "anonymous"}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.success) {
      // Filter unique locations to avoid duplicates
      const unique = [];
      const seen = new Set();
      for (const visit of res.data.data) {
        if (!seen.has(visit.location)) {
          seen.add(visit.location);
          unique.push(visit);
        }
      }
      setUserDetails(unique);
      console.log("Fetched user details:", unique);
    }
  } catch (err) {
    console.error("Error fetching user details:", err);
  } finally {
    setUserLoading(false);
  }
};


const handleCloseModal = () => {
  setOpenModal(false);
  setSelectedUser(null);
};


  const token = localStorage.getItem("token");

  const applyPreset = (months) => {
    setPreset(`${months}m`);
    setFromDate(dayjs().subtract(months, "month"));
    setToDate(dayjs());
  };

  // 🧠 Fetch Data Function (Unified)
  const fetchData = async () => {
    const from = fromDate.startOf("day").toISOString();
    const to = toDate.endOf("day").toISOString();

    try {
      if (tabValue === 0) {
        setLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/track/user-stats?from=${from}&to=${to}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          const formatted = res.data.data.map((item, index) => ({
            id: index + 1,
            username: item.username || "Anonymous",
            totalVisits: item.totalVisits,
            totalTimeSpent: item.totalTimeSpent,
            uniqueLocations: item.uniqueLocations.join(", "),
            uniqueDistricts: item.uniqueDistricts.join(", "),
            userId: item.user,
          }));
          setRows(formatted);
        }
      } else if (tabValue === 1) {
        setLocLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/track/location-stats?from=${from}&to=${to}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
      }
      else if (tabValue === 2) {
  setHotelLoading(true);
  const res = await axios.get(
    `${BACKEND_URL}/track/hotel-stats?from=${from}&to=${to}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.data.success) {
    const formatted = res.data.data.map((hotel, index) => ({
      id: index + 1,
      hotelId: hotel.hotelId,
      hotelName: hotel.hotelName,
      totalVisits: hotel.totalVisits,
      totalTimeSpent: hotel.totalTimeSpent,
      avgTimeSpent: hotel.avgTimeSpent?.toFixed(2) || 0,
      externalClicks: hotel.externalClicks,
    }));
    setHotelStats(formatted);
  }
}

    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
      setLocLoading(false);
      setHotelLoading(false);
    }
  };

  // Fetch when tab or date changes
  useEffect(() => {
    fetchData();
  }, [tabValue, fromDate, toDate]);

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box className="p-6 bg-gray-100 min-h-screen space-y-8">
      <Typography variant="h4" className="font-bold mb-4">
        Analytics Dashboard
      </Typography>

      {/* --- Date Filter Controls --- */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" className="mb-3">
          Filter by Date Range
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <DatePicker
            label="From"
            value={fromDate}
            onChange={(newValue) => {
              setPreset(null);
              setFromDate(newValue);
            }}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="To"
            value={toDate}
            onChange={(newValue) => {
              setPreset(null);
              setToDate(newValue);
            }}
            slotProps={{ textField: { size: "small" } }}
          />

          <Button variant="contained" onClick={fetchData}>
            Apply
          </Button>

          <Typography sx={{ ml: 2 }}>Presets:</Typography>
          {[1, 3, 6].map((m) => (
            <Button
              key={m}
              variant={preset === `${m}m` ? "contained" : "outlined"}
              onClick={() => applyPreset(m)}
            >
              Last {m} Month{m > 1 ? "s" : ""}
            </Button>
          ))}
        </Stack>
      </Paper>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="User Visit Analytics" />
        <Tab label="Location Analytics" />
        <Tab label="Hotel Analytics" />
      </Tabs>

      {/* USER TAB */}
      {tabValue === 0 &&
        (loading ? (
          <Box className="flex justify-center items-center h-[60vh]">
            <CircularProgress />
          </Box>
        ) : (
          <Paper style={{ height: 650, width: "100%", padding: "1rem" }}>
            <DataGrid
  rows={rows}
  columns={[
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
          variant="outlined"
          size="small"
          onClick={() => handleViewDetails(params.row)}
        >
          View Details
        </Button>
      ),
    },
  ]}
  pageSize={10}
  components={{ Toolbar: GridToolbar }}
/>

          </Paper>
        ))}
        

      {/* LOCATION TAB */}
      {tabValue === 1 &&
        (locLoading ? (
          <Box className="flex justify-center items-center h-[60vh]">
            <CircularProgress />
          </Box>
        ) : (
          <Paper style={{ height: 650, width: "100%", padding: "1rem" }}>
  <DataGrid
    rows={locationStats}
    columns={[
      { field: "location", headerName: "Location", flex: 2 },
      { field: "totalVisits", headerName: "Total Visits", flex: 1 },
      { field: "uniqueUsers", headerName: "Unique Users", flex: 1 },
      { field: "totalTimeSpent", headerName: "Total Time (s)", flex: 1 },
      { field: "avgTimeSpent", headerName: "Avg Time (s)", flex: 1 },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenLocationModal(params.row.location)}
          >
            View Details
          </Button>
        ),
      },
    ]}
    pageSize={10}
    components={{ Toolbar: GridToolbar }}
  />
</Paper>

        ))}
        {/* HOTEL TAB */}
{tabValue === 2 && (
  <Paper sx={{ height: 650, width: "100%", p: 2 }}>
    {hotelLoading ? (
      <Box className="flex justify-center items-center h-[60vh]">
        <CircularProgress />
      </Box>
    ) : (
      <DataGrid
        rows={hotelStats}
        columns={[
          { field: "hotelName", headerName: "Hotel Name", flex: 2 },
          { field: "totalVisits", headerName: "Total Visits", flex: 1 },
          { field: "totalTimeSpent", headerName: "Total Time (s)", flex: 1 },
          { field: "avgTimeSpent", headerName: "Avg Time (s)", flex: 1 },
          { field: "externalClicks", headerName: "External Clicks", flex: 1 },
          {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenHotelModal(params.row)}
              >
                View Details
              </Button>
            ),
          },
        ]}
        pageSize={10}
        components={{ Toolbar: GridToolbar }}
      />
    )}
  </Paper>
)}

    </Box>
    <Modal open={openModal} onClose={handleCloseModal}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "background.paper",
      p: 4,
      borderRadius: 2,
      boxShadow: 24,
      width: 500,
      maxHeight: "80vh",
      overflowY: "auto",
    }}
  >
    {selectedUser ? (
      <>
        <Typography variant="h6" gutterBottom>
          User Details - {selectedUser.username}
        </Typography>

        <Typography sx={{ mb: 1 }}>
          <strong>Total Visits:</strong> {selectedUser.totalVisits}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Total Time Spent:</strong> {selectedUser.totalTimeSpent} s
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          <strong>Unique Locations Visited:</strong>
        </Typography>

        {userLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : userDetails.length === 0 ? (
          <Typography sx={{ mt: 1 }}>No visit data available.</Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            {userDetails.map((visit, index) => (
              <Paper
                key={index}
                sx={{ p: 1.5, mb: 1, border: "1px solid #eee" }}
                elevation={0}
              >
                <Typography variant="body1">
                  <strong>Location:</strong> {visit.location}
                </Typography>
                <Typography variant="body2">
                  <strong>District:</strong> {visit.district}
                </Typography>
                <Typography variant="body2">
                  <strong>Time Spent:</strong> {visit.timeSpent}s
                </Typography>
                <Typography variant="body2">
                  <strong>Exit Reason:</strong> {visit.exitReason}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleCloseModal}
          fullWidth
        >
          Close
        </Button>
      </>
    ) : (
      <Typography>Loading...</Typography>
    )}
  </Box>
</Modal>
<Modal open={openLocationModal} onClose={handleCloseLocationModal}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "background.paper",
      p: 4,
      borderRadius: 2,
      boxShadow: 24,
      width: 500,
      maxHeight: "80vh",
      overflowY: "auto",
    }}
  >
    {selectedLocation ? (
      <>
        <Typography variant="h6" gutterBottom>
          Location Details - {selectedLocation.location}
        </Typography>

        <Typography sx={{ mb: 1 }}>
          <strong>Total Visits:</strong> {selectedLocation.totalVisits}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Unique Users:</strong> {selectedLocation.uniqueUsers}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Total Time Spent:</strong> {selectedLocation.totalTimeSpent} s
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Average Time Spent:</strong> {selectedLocation.avgTimeSpent} s
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          <strong>Visitors:</strong>
        </Typography>

        {locationLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : locationDetails.length === 0 ? (
          <Typography sx={{ mt: 1 }}>No visitor data available.</Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            {locationDetails.map((user, index) => (
              <Paper
                key={index}
                sx={{ p: 1.5, mb: 1, border: "1px solid #eee" }}
                elevation={0}
              >
                <Typography variant="body1">
                  <strong>User:</strong> {user.username}
                </Typography>
                <Typography variant="body2">
                  <strong>Entry:</strong> {user.entryTime}
                </Typography>
                <Typography variant="body2">
                  <strong>Exit:</strong> {user.exitTime || "Still Inside"}
                </Typography>
                <Typography variant="body2">
                  <strong>Exit Reason:</strong> {user.exitReason || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Time Spent:</strong> {user.timeSpent}s
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleCloseLocationModal}
          fullWidth
        >
          Close
        </Button>
      </>
    ) : (
      <Typography>Loading...</Typography>
    )}
  </Box>
</Modal>
{/* --- HOTEL MODAL --- */}
{/* --- HOTEL MODAL --- */}
<Modal open={openHotelModal} onClose={() => setOpenHotelModal(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "background.paper",
      p: 4,
      borderRadius: 2,
      boxShadow: 24,
      width: 500,
      maxHeight: "80vh",
      overflowY: "auto",
    }}
  >
    {selectedHotel ? (
      <>
        <Typography variant="h6" gutterBottom>
          Hotel Details - {selectedHotel.hotelName}
        </Typography>

        {hotelDetailsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : hotelDetails.length === 0 ? (
          <Typography>No data available.</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {hotelDetails.map((user, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, border: "1px solid #eee" }} elevation={0}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  <strong>User:</strong> {user.username || "Anonymous"} | Total Clicks: {user.totalClicks}
                </Typography>

                {user.locations.map((visit, vIndex) => (
                  <Paper
                    key={vIndex}
                    sx={{ p: 1, mb: 1, border: "1px dashed #ccc" }}
                    elevation={0}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      <strong>User:</strong> {user.username ? user.username : "Anonymous"} | Total Clicks: {user.totalClicks}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Location:</strong> {visit.location}
                    </Typography>
                    <Typography variant="body2">
                      <strong>District:</strong> {visit.district}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time Spent:</strong> {visit.timeSpent}s
                    </Typography>
                    <Typography variant="body2">
                      <strong>Exit Reason:</strong> {visit.exitReason || "N/A"}
                    </Typography>
                  </Paper>
                ))}
              </Paper>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          fullWidth
          onClick={() => setOpenHotelModal(false)}
        >
          Close
        </Button>
      </>
    ) : (
      <Typography>Loading...</Typography>
    )}
  </Box>
</Modal>





    </LocalizationProvider>
  );
}
