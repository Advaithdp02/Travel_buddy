import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Modal,
  CircularProgress,
} from "@mui/material";
import EditStaffModal from "./EditStaffModal.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchStaff = async () => {
    setLoading(true);
    const res = await axios.get(`${BACKEND_URL}/users/admin/staff`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStaff(res.data.users);
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  if (loading)
    return (
      <Box className="flex justify-center mt-20">
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Manage Staff
      </Typography>

      <div className="grid gap-4">
        {staff.map((s) => (
          <Card
            key={s._id}
            className="cursor-pointer"
            onClick={() => setSelected(s)}
          >
            <CardContent>
              <Typography variant="h6">{s.name}</Typography>
              <Typography variant="body2">{s.email}</Typography>
              <Typography variant="caption">Staff</Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <EditStaffModal
          staff={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchStaff}
        />
      )}
    </Box>
  );
}
