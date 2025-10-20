import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    published: false,
    image: null,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBlogs(res.data.blogs || res.data || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError("Failed to fetch blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete blog. Try again.");
    }
  };

  const handleOpenModal = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      tags: blog.tags.join(", "),
      published: blog.published,
      image: null, // for new upload
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentBlog(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdateBlog = async () => {
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("content", formData.content);
      data.append("tags", formData.tags);
      data.append("published", formData.published);
      if (formData.image) data.append("image", formData.image);

      const res = await axios.put(`${BACKEND_URL}/blogs/${currentBlog._id}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setBlogs(blogs.map((b) => (b._id === res.data._id ? res.data : b)));
      handleCloseModal();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update blog.");
    }
  };

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
        Manage Blogs
      </Typography>

      {blogs.length === 0 ? (
        <Typography>No blogs found.</Typography>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card key={blog._id} className="shadow-md rounded-xl bg-white">
              {blog.image ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={blog.image}
                  alt={blog.title}
                  className="rounded-t-xl"
                />
              ) : (
                <Box className="h-40 bg-gray-200 flex items-center justify-center rounded-t-xl">
                  <Typography color="textSecondary">No Image</Typography>
                </Box>
              )}
              <CardContent className="flex flex-col gap-2">
                <Typography variant="h6">{blog.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Author: {blog.author?.name || "Unknown"}
                </Typography>
                {blog.tags && blog.tags.length > 0 && (
                  <Box className="flex flex-wrap gap-1 mt-1">
                    {blog.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" color="primary" />
                    ))}
                  </Box>
                )}
                <Typography variant="body2" color="textSecondary" className="mt-1">
                  Status: {blog.published ? "Published" : "Draft"}
                </Typography>
                <Box className="flex gap-2 mt-2">
                  <Button variant="contained" color="primary" onClick={() => handleOpenModal(blog)}>
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(blog._id)}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Blog Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Edit Blog</DialogTitle>
        <DialogContent className="flex flex-col gap-3">
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleFormChange}
            multiline
            rows={6}
            fullWidth
          />
          <TextField
            label="Tags (comma separated)"
            name="tags"
            value={formData.tags}
            onChange={handleFormChange}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.published}
                onChange={handleFormChange}
                name="published"
              />
            }
            label="Published"
          />
          <input type="file" name="image" accept="image/*" onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateBlog}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
