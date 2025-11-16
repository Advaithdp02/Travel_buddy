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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminAnalysis() {
  const token = localStorage.getItem("token");

  // State
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [locationStats, setLocationStats] = useState([]);
  const [locLoading, setLocLoading] = useState(false);

  const [fromDate, setFromDate] = useState(dayjs().subtract(1, "month"));
  const [toDate, setToDate] = useState(dayjs());
  const [preset, setPreset] = useState("1m");

  // User modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // Location modal
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Hotel stats
  const [hotelStats, setHotelStats] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);

  // Hotel modal
  const [openHotelModal, setOpenHotelModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelDetails, setHotelDetails] = useState([]);
  const [hotelDetailsLoading, setHotelDetailsLoading] = useState(false);

  const applyPreset = (months) => {
    setPreset(`${months}m`);
    setFromDate(dayjs().subtract(months, "month"));
    setToDate(dayjs());
  };

  const handleTabChange = (e, v) => setTabValue(v);

  /* ---------------------------------------------------------
      FETCH DATA
  --------------------------------------------------------- */
  const fetchData = async () => {
    const from = fromDate.startOf("day").toISOString();
    const to = toDate.endOf("day").toISOString();

    try {
      if (tabValue === 0) {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/track/user-stats?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setRows(
            res.data.data.map((item, index) => ({
              id: index + 1,
              username: item.username || "Anonymous",
              totalVisits: item.totalVisits,
              totalTimeSpent: item.totalTimeSpent,
              uniqueLocations: item.uniqueLocations.join(", "),
              uniqueDistricts: item.uniqueDistricts.join(", "),
              userId: item.user,
            }))
          );
        }
      }

      if (tabValue === 1) {
        setLocLoading(true);
        const res = await axios.get(`${BACKEND_URL}/track/location-stats?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setLocationStats(
            res.data.data.map((loc, index) => ({
              id: index + 1,
              location: loc.location,
              totalVisits: loc.totalVisits,
              uniqueUsers: loc.uniqueUsersCount,
              totalTimeSpent: loc.totalTimeSpent,
              avgTimeSpent: loc.avgTimeSpent?.toFixed(2),
            }))
          );
        }
      }

      if (tabValue === 2) {
        setHotelLoading(true);
        const res = await axios.get(`${BACKEND_URL}/track/hotel-stats?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setHotelStats(
            res.data.data.map((hotel, index) => ({
              id: index + 1,
              hotelId: hotel.hotelId,
              hotelName: hotel.hotelName,
              totalVisits: hotel.totalVisits,
              totalTimeSpent: hotel.totalTimeSpent,
              avgTimeSpent: hotel.avgTimeSpent?.toFixed(2),
              externalClicks: hotel.externalClicks,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setLocLoading(false);
      setHotelLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue, fromDate, toDate]);

  /* ---------------------------------------------------------
      USER DETAILS MODAL
  --------------------------------------------------------- */
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setOpenModal(true);
    setUserLoading(true);

    try {
      const res = await axios.get(`${BACKEND_URL}/track/user-details/${user.userId || "anonymous"}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUserDetails(res.data.data);
      }
    } catch (err) {
      console.error("User details error:", err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  /* ---------------------------------------------------------
      LOCATION DETAILS MODAL
  --------------------------------------------------------- */
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
      console.error("Location details error:", err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCloseLocationModal = () => {
    setOpenLocationModal(false);
    setSelectedLocation(null);
  };

  /* ---------------------------------------------------------
      HOTEL DETAILS MODAL
  --------------------------------------------------------- */
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
      console.error("Hotel details error:", err);
    } finally {
      setHotelDetailsLoading(false);
    }
  };

  /* ---------------------------------------------------------
      RENDER
  --------------------------------------------------------- */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-6 bg-gray-100 min-h-screen space-y-8">
        <Typography variant="h4" className="font-bold mb-4">
          Analytics Dashboard
        </Typography>

        {/* DATE FILTERS */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" className="mb-3">Filter by Date</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <DatePicker label="From" value={fromDate} onChange={(v) => setFromDate(v)} />
            <DatePicker label="To" value={toDate} onChange={(v) => setToDate(v)} />

            <Button variant="contained" onClick={fetchData}>Apply</Button>

            {[1, 3, 6].map((m) => (
              <Button
                key={m}
                variant={preset === `${m}m` ? "contained" : "outlined"}
                onClick={() => applyPreset(m)}
              >
                Last {m} Month
              </Button>
            ))}
          </Stack>
        </Paper>

        {/* TABS */}
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Analytics" />
          <Tab label="Location Analytics" />
          <Tab label="Hotel Analytics" />
        </Tabs>

        {/* USER TABLE */}
        {tabValue === 0 && (
          loading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ height: 650, p: 2 }}>
              <DataGrid
                rows={rows}
                columns={[
                  { field: "username", headerName: "Username", flex: 1 },
                  { field: "uniqueLocations", headerName: "Locations", flex: 2 },
                  { field: "uniqueDistricts", headerName: "Districts", flex: 2 },
                  { field: "totalVisits", headerName: "Visits", flex: 1 },
                  { field: "totalTimeSpent", headerName: "Time (s)", flex: 1 },
                  {
                    field: "actions",
                    headerName: "Actions",
                    flex: 1,
                    renderCell: (params) => (
                      <Button onClick={() => handleViewDetails(params.row)}>
                        View Details
                      </Button>
                    ),
                  },
                ]}
                pageSize={10}
                components={{ Toolbar: GridToolbar }}
              />
            </Paper>
          )
        )}

        {/* LOCATION TABLE */}
        {tabValue === 1 && (
          locLoading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ height: 650, p: 2 }}>
              <DataGrid
                rows={locationStats}
                columns={[
                  { field: "location", headerName: "Location", flex: 2 },
                  { field: "totalVisits", headerName: "Visits", flex: 1 },
                  { field: "uniqueUsers", headerName: "Users", flex: 1 },
                  { field: "totalTimeSpent", headerName: "Time (s)", flex: 1 },
                  { field: "avgTimeSpent", headerName: "Avg Time", flex: 1 },
                  {
                    field: "actions",
                    headerName: "Actions",
                    flex: 1,
                    renderCell: (params) => (
                      <Button onClick={() => handleOpenLocationModal(params.row.location)}>
                        View Details
                      </Button>
                    ),
                  },
                ]}
                pageSize={10}
                components={{ Toolbar: GridToolbar }}
              />
            </Paper>
          )
        )}

        {/* HOTEL TABLE */}
        {tabValue === 2 && (
          hotelLoading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ height: 650, p: 2 }}>
              <DataGrid
                rows={hotelStats}
                columns={[
                  { field: "hotelName", headerName: "Hotel", flex: 2 },
                  { field: "totalVisits", headerName: "Visits", flex: 1 },
                  { field: "totalTimeSpent", headerName: "Time (s)", flex: 1 },
                  { field: "avgTimeSpent", headerName: "Avg Time", flex: 1 },
                  { field: "externalClicks", headerName: "External Clicks", flex: 1 },
                  {
                    field: "actions",
                    headerName: "Actions",
                    flex: 1,
                    renderCell: (params) => (
                      <Button onClick={() => handleOpenHotelModal(params.row)}>
                        View Details
                      </Button>
                    ),
                  },
                ]}
                pageSize={10}
                components={{ Toolbar: GridToolbar }}
              />
            </Paper>
          )
        )}

        {/* USER MODAL */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">
              User Details - {selectedUser?.username}
            </Typography>

            {userLoading ? (
              <CircularProgress />
            ) : (
              userDetails.map((v, i) => (
                <Paper key={i} sx={itemStyle}>
                  <Typography><b>Location:</b> {v.location}</Typography>
                  <Typography><b>District:</b> {v.district}</Typography>
                  <Typography><b>Time:</b> {v.timeSpent}s</Typography>
                  <Typography><b>Exit:</b> {v.exitReason}</Typography>

                  {/* GEOLOCATION */}
                  {v.geoLocation?.coordinates && (
                    <>
                      <Typography><b>Latitude:</b> {v.geoLocation.coordinates[1]}</Typography>
                      <Typography><b>Longitude:</b> {v.geoLocation.coordinates[0]}</Typography>
                    </>
                  )}
                </Paper>
              ))
            )}

            <Button variant="contained" onClick={handleCloseModal}>Close</Button>
          </Box>
        </Modal>

        {/* LOCATION MODAL */}
        <Modal open={openLocationModal} onClose={handleCloseLocationModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">Location Details - {selectedLocation}</Typography>

            {locationLoading ? (
              <CircularProgress />
            ) : (
              locationDetails.map((v, i) => (
                <Paper key={i} sx={itemStyle}>
                  <Typography><b>User:</b> {v.username}</Typography>
                  <Typography><b>Time:</b> {v.timeSpent}s</Typography>
                  <Typography><b>Exit:</b> {v.exitReason}</Typography>

                  {v.geoLocation?.coordinates && (
                    <>
                      <Typography><b>Latitude:</b> {v.geoLocation.coordinates[1]}</Typography>
                      <Typography><b>Longitude:</b> {v.geoLocation.coordinates[0]}</Typography>
                    </>
                  )}
                </Paper>
              ))
            )}

            <Button variant="contained" onClick={handleCloseLocationModal}>Close</Button>
          </Box>
        </Modal>

        {/* HOTEL MODAL */}
        <Modal open={openHotelModal} onClose={() => setOpenHotelModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6">
              Hotel Details - {selectedHotel?.hotelName}
            </Typography>

            {hotelDetailsLoading ? (
              <CircularProgress />
            ) : (
              hotelDetails.map((u, i) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                  <Typography><b>User:</b> {u.username}</Typography>
                  <Typography><b>Total Clicks:</b> {u.totalClicks}</Typography>

                  {u.locations.map((v, j) => (
                    <Paper key={j} sx={itemStyle}>
                      <Typography><b>Location:</b> {v.location}</Typography>
                      <Typography><b>District:</b> {v.district}</Typography>
                      <Typography><b>Time:</b> {v.timeSpent}s</Typography>
                      <Typography><b>Exit:</b> {v.exitReason}</Typography>

                      {v.geoLocation?.coordinates && (
                        <>
                          <Typography><b>Latitude:</b> {v.geoLocation.coordinates[1]}</Typography>
                          <Typography><b>Longitude:</b> {v.geoLocation.coordinates[0]}</Typography>
                        </>
                      )}
                    </Paper>
                  ))}
                </Paper>
              ))
            )}

            <Button
              variant="contained"
              onClick={() => setOpenHotelModal(false)}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  p: 4,
  bgcolor: "background.paper",
  borderRadius: 2,
  width: 500,
  maxHeight: "80vh",
  overflowY: "auto",
};

const itemStyle = {
  p: 2,
  mb: 2,
  border: "1px solid #ddd",
  borderRadius: 1,
};
