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
import GeoAnalyticsMap from "./GeoAnalyticsMap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* ------------------------------------------------------------
   UNIVERSAL EXCEL EXPORT
------------------------------------------------------------ */
const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export default function AdminAnalysis() {
  const token = localStorage.getItem("token");

  // Summary table data
  const [rows, setRows] = useState([]);
  const [locationStats, setLocationStats] = useState([]);
  const [hotelStats, setHotelStats] = useState([]);
  const [geoRows, setGeoRows] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  const [hotelLoading, setHotelLoading] = useState(false);

  // UI states
  const [tabValue, setTabValue] = useState(0);

  // Date filters
  const [fromDate, setFromDate] = useState(dayjs().subtract(1, "month"));
  const [toDate, setToDate] = useState(dayjs());
  const [preset, setPreset] = useState("1m");

  // User details modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // Location details modal
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Hotel details modal
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


  /* ------------------------------------------------------------
      FETCH MAIN TABLE DATA
  ------------------------------------------------------------ */
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
          setRows(
            res.data.data.map((item, index) => ({
              id: index + 1,
              username: item.username || "Anonymous",
              totalVisits: item.totalVisits,
              totalTimeSpent: item.totalTimeSpent,
              uniqueLocations: item.uniqueLocations.join(", "),
              uniqueDistricts: item.uniqueDistricts.join(", "),
              userId: item.user,
              fromUrl: item.fromUrl || "",
              toUrl: item.toUrl || "",
              actionType:item.actionType || "",
              fromLocation:item.fromLocation || "",
              toLocation : item.toLocation || "",
              fromDistrict: item.fromDistrict || "",
              toDistrict: item.toDistrict || "",
            }))
          );
        }
      }

      if (tabValue === 1) {
        setLocLoading(true);
        const res = await axios.get(
          `${BACKEND_URL}/track/location-stats?from=${from}&to=${to}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
        const res = await axios.get(
          `${BACKEND_URL}/track/hotel-stats?from=${from}&to=${to}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

      if (tabValue === 3) {
        const res = await axios.get(`${BACKEND_URL}/track/geo-stats/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setGeoRows(res.data.data);
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

  /* ------------------------------------------------------------
      FETCH USER DETAILS
  ------------------------------------------------------------ */
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setOpenModal(true);
    setUserLoading(true);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/track/user-details/${user.userId || "anonymous"}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setUserDetails(res.data.data);
    } catch (err) {
      console.error("User details error:", err);
    } finally {
      setUserLoading(false);
    }
  };
  /* ------------------------------------------------------------
      FETCH ALL USER DETAILS
  ------------------------------------------------------------ */
  const exportAllUserVisits = async () => {
  try {
    const from = fromDate.startOf("day").toISOString();
const to = toDate.endOf("day").toISOString();

const res = await axios.get(
  `${BACKEND_URL}/track/all-visits?from=${from}&to=${to}`,
  { headers: { Authorization: `Bearer ${token}` } }
);


    if (!res.data.success) return;

    // Export directly to Excel
    exportToExcel(res.data.data, "All_User_Visit_Details");
  } catch (err) {
    console.error("Full visit export error:", err);
  }
};

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  /* ------------------------------------------------------------
      FETCH LOCATION DETAILS
  ------------------------------------------------------------ */
  const handleOpenLocationModal = async (location) => {
    setSelectedLocation(location);
    setOpenLocationModal(true);
    setLocationLoading(true);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/track/location-details/${location}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

 /* ------------------------------------------------------------
      FETCH HOTEL DETAILS
  ------------------------------------------------------------ */
  const handleOpenHotelModal = async (hotel) => {
    setSelectedHotel(hotel);
    setOpenHotelModal(true);
    setHotelDetailsLoading(true);

    try {
      const res = await axios.get(
        `${BACKEND_URL}/track/hotel-details/${hotel.hotelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setHotelDetails(res.data.data);
    } catch (err) {
      console.error("Hotel details error:", err);
    } finally {
      setHotelDetailsLoading(false);
    }
  };

  /* ------------------------------------------------------------
      RENDER UI
  ------------------------------------------------------------ */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-6 bg-gray-100 min-h-screen space-y-8">
        
        <Typography variant="h4" className="font-bold mb-4">
          Analytics Dashboard
        </Typography>

        {/* DATE FILTERS */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6">Filter by Date</Typography>

          <Stack direction="row" spacing={2}>
            <DatePicker label="From" value={fromDate} onChange={setFromDate} />
            <DatePicker label="To" value={toDate} onChange={setToDate} />

            <Button variant="contained" onClick={fetchData}>
              Apply
            </Button>

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
          <Tab label="Geo Map Analytics" />
        </Tabs>

        {/* ------------------------------------------------------
            USER ANALYTICS TABLE
        ------------------------------------------------------ */}
        {tabValue === 0 && (
          loading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ height: 650, p: 2 }}>
              <Button
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() => exportToExcel(rows, "User_Analytics")}
              >
                Export Users
              </Button>
              <Button
  variant="outlined"
  sx={{ mb: 2, ml: 2 }}
  onClick={exportAllUserVisits}
>
  Export Full Visit Details
</Button>


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

        {/* ------------------------------------------------------
            LOCATION ANALYTICS TABLE
        ------------------------------------------------------ */}
        {tabValue === 1 && (
          locLoading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ height: 650, p: 2 }}>
              <Button
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() =>
                  exportToExcel(locationStats, "Location_Analytics")
                }
              >
                Export Locations
              </Button>

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
                      <Button
                        onClick={() =>
                          handleOpenLocationModal(params.row.location)
                        }
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
          )
        )}

        {/* ------------------------------------------------------
            HOTEL ANALYTICS TABLE
        ------------------------------------------------------ */}
        {tabValue === 2 && (
          hotelLoading ? (
            <CircularProgress />
          ) : (
            <Paper sx={{ height: 650, p: 2 }}>
              
              <Button
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() => exportToExcel(hotelStats, "Hotel_Analytics")}
              >
                Export Hotels
              </Button>

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

        {/* ------------------------------------------------------
            GEO MAP ANALYTICS
        ------------------------------------------------------ */}
        {tabValue === 3 && (
          <Paper sx={{ height: 650, p: 2 }}>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={() => exportToExcel(geoRows, "Geo_Map_Analytics")}
            >
              Export Geo Data
            </Button>

            <GeoAnalyticsMap />
          </Paper>
        )}

        {/* ------------------------------------------------------
            USER DETAILS MODAL
        ------------------------------------------------------ */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">
              User Details — {selectedUser?.username}
            </Typography>

            {/* EXPORT DETAILS */}
            <Button
              variant="contained"
              sx={{ my: 2 }}
              onClick={() =>
                exportToExcel(
                  userDetails,
                  `User_Details_${selectedUser?.username}`
                )
              }
            >
              Export This User's Full History
            </Button>

            {userLoading ? (
              <CircularProgress />
            ) : (
              userDetails.map((v, i) => (
                <Paper key={i} sx={itemStyle}>
                  <Typography><b>Location:</b> {v.location}</Typography>
                  <Typography><b>District:</b> {v.district}</Typography>
                  <Typography><b>Time:</b> {v.timeSpent}s</Typography>
                  <Typography>
  <b>Exit:</b>{" "}
  {(() => {
    console.log("DETAIL ROW", v);

    const reason = v.exitReason || "";

    const from = v.fromLocation || "";
    const to = v.toLocation || "";

    let nav = "";
    if (from && to) nav = ` (from ${from} → ${to})`;
    else if (from) nav = ` (from ${from})`;
    else if (to) nav = ` (to ${to})`;

    return reason + nav;
  })()}
</Typography>



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

        {/* ------------------------------------------------------
            LOCATION DETAILS MODAL
        ------------------------------------------------------ */}
        <Modal open={openLocationModal} onClose={handleCloseLocationModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6">
              Location Details — {selectedLocation}
            </Typography>

            {/* EXPORT DETAILS */}
            <Button
              variant="contained"
              sx={{ my: 2 }}
              onClick={() =>
                exportToExcel(
                  locationDetails,
                  `Location_Details_${selectedLocation}`
                )
              }
            >
              Export Full Visit History for This Location
            </Button>

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

        {/* ------------------------------------------------------
            HOTEL DETAILS MODAL
        ------------------------------------------------------ */}
        <Modal open={openHotelModal} onClose={() => setOpenHotelModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6">
              Hotel Details — {selectedHotel?.hotelName}
            </Typography>

            {/* EXPORT DETAILS */}
            <Button
              variant="contained"
              sx={{ my: 2 }}
              onClick={() =>
                exportToExcel(
                  hotelDetails,
                  `Hotel_Details_${selectedHotel?.hotelName}`
                )
              }
            >
              Export Full Hotel Click History
            </Button>

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

            <Button variant="contained" onClick={() => setOpenHotelModal(false)}>
              Close
            </Button>
          </Box>
        </Modal>

      </Box>
    </LocalizationProvider>
  );
}

/* ------------------------------------------------------------
      STYLES
------------------------------------------------------------ */
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
