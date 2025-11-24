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
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  // ---------------- Debounce Search ----------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // wait 300ms before applying search

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // ---------------- Fetch Users (pagination + backend search) ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page,
          limit,
          search: debouncedSearch || "",
        });

        const res = await axios.get(
          `${BACKEND_URL}/users/admin/users?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, page, limit, debouncedSearch]);

  // ---------------- Delete User ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/users/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));

      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data.user || u : u))
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
    <Box className="p-6 bg-gray-100 min-h-screen space-y-6">
      <Typography variant="h4" className="font-bold">
        Manage Users
      </Typography>

      {/* 🔍 Search Bar */}
      <Box className="flex justify-end mb-4">
        <TextField
          size="small"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // reset to page 1 on search
          }}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* USERS LIST */}
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
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
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

      {/* ---------------- Pagination ---------------- */}
      <Box className="flex justify-center items-center gap-4 mt-6">
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <Typography>
          Page {page} of {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
