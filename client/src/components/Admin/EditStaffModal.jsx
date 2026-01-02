import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function EditStaffModal({ staff, onClose, onUpdated }) {
  const [form, setForm] = useState({ ...staff });
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await axios.put(
      `${BACKEND_URL}/users/admin/staff/${staff._id}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onUpdated();
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <Box className="bg-white p-6 rounded-xl w-[90%] max-w-lg mx-auto mt-24">
        <Typography variant="h5" mb={2}>
          Edit Staff Profile
        </Typography>

        <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Username" name="username" value={form.username} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Phone" name="phone" value={form.phone || ""} onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Bio" name="bio" value={form.bio || ""} onChange={handleChange} multiline rows={3} sx={{ mb: 2 }} />

        <Box className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default EditStaffModal;
