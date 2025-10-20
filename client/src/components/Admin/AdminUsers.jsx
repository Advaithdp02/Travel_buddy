import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminUsers() {
  const [users, setUsers] = useState([]); // always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // for error handling

  const token = localStorage.getItem("token");

  // ---------------- Fetch Users ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/users/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        // Ensure users is always an array
        const usersArray = Array.isArray(res.data)
          ? res.data
          : res.data.users || [];
        setUsers(usersArray);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // ---------------- Delete User ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/users/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user. Try again.");
    }
  };

  // ---------------- Update Role ----------------
  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/users/admin/users/${id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the local user array
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === id ? res.data.user || u : u))
      );
    } catch (err) {
      console.error("Role update failed:", err);
      alert("Failed to update role. Try again.");
    }
  };

  // ---------------- Render ----------------
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
    <Box className="p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6 font-bold">
        Manage Users
      </Typography>

      {users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user._id} className="shadow-md rounded-xl bg-white">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Box>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Role: {user.role}
                  </Typography>
                </Box>

                <Box className="flex items-center gap-4">
                  <Select
                    size="small"
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user._id, e.target.value)
                    }
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Box>
  );
}
