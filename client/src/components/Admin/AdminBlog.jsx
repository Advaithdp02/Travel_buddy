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
  const [openCreateModal, setOpenCreateModal] = useState(false); // ⭐ NEW
  const [currentBlog, setCurrentBlog] = useState(null);

  const emptyForm = {
    title: "",
    slug: "",
    content: "",
    tags: "",
    published: false,
    image: null,
    clearImage: false,
    author: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [createForm, setCreateForm] = useState(emptyForm); // ⭐ NEW

  const token = localStorage.getItem("token");

  // ====================== FETCH BLOGS ======================
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

  // ====================== DELETE BLOG ======================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete blog.");
    }
  };

  // ====================== OPEN EDIT MODAL ======================
  const handleOpenModal = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      tags: blog.tags.join(", "),
      published: blog.published,
      image: null,
      clearImage: false,
      author: blog.author || "",
    });
    setOpenModal(true);
  };

  const handleOpenCreateModal = () => {
    setCreateForm(emptyForm);
    setOpenCreateModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentBlog(null);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  // ====================== HANDLE FORM CHANGE (EDIT) ======================
  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
        clearImage: false,
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ====================== HANDLE FORM CHANGE (CREATE) ======================
  const handleCreateChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setCreateForm((prev) => ({ ...prev, image: files[0] }));
    } else if (type === "checkbox") {
      setCreateForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setCreateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ====================== UPDATE BLOG ======================
  const handleUpdateBlog = async () => {
    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("content", formData.content);
      data.append("tags", formData.tags);
      data.append("published", formData.published);
      data.append("author", formData.author);

      if (formData.image) data.append("image", formData.image);
      if (formData.clearImage) data.append("clearImage", "true");

      const res = await axios.put(
        `${BACKEND_URL}/blogs/${currentBlog._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setBlogs(blogs.map((b) => (b._id === res.data._id ? res.data : b)));
      handleCloseModal();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update blog.");
    }
  };

  // ====================== CREATE BLOG ======================
  const handleCreateBlog = async () => {
    try {
      const data = new FormData();

      data.append("title", createForm.title);
      data.append("slug", createForm.slug);
      data.append("content", createForm.content);
      data.append("tags", createForm.tags);
      data.append("published", createForm.published);
      data.append("author", createForm.author);

      if (createForm.image) data.append("image", createForm.image);

      const res = await axios.post(`${BACKEND_URL}/blogs`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBlogs([...blogs, res.data]);
      handleCloseCreateModal();
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create blog.");
    }
  };

  // ====================== UI RENDERING ======================
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

      {/* ========== ADD BLOG BUTTON ========== */}
      <Button
        variant="contained"
        color="success"
        className="mb-6"
        onClick={handleOpenCreateModal}
      >
        + Add Blog
      </Button>

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
                  Author: {blog.author || "Unknown"}
                </Typography>

                {blog.tags?.length > 0 && (
                  <Box className="flex flex-wrap gap-1">
                    {blog.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" color="primary" />
                    ))}
                  </Box>
                )}

                <Typography variant="body2" color="textSecondary">
                  Status: {blog.published ? "Published" : "Draft"}
                </Typography>

                <Box className="flex gap-2 mt-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenModal(blog)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(blog._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ====================== CREATE BLOG MODAL ====================== */}
      <Dialog open={openCreateModal} onClose={handleCloseCreateModal} fullWidth maxWidth="md">
        <DialogTitle>Create New Blog</DialogTitle>

        <DialogContent className="flex flex-col gap-3">

          <TextField label="Title" name="title" value={createForm.title} onChange={handleCreateChange} fullWidth />
          <TextField label="Slug" name="slug" value={createForm.slug} onChange={handleCreateChange} fullWidth />

          <TextField label="Author" name="author" value={createForm.author} onChange={handleCreateChange} fullWidth />

          <TextField label="Content" name="content" value={createForm.content} onChange={handleCreateChange} multiline rows={6} fullWidth />

          <TextField label="Tags (comma separated)" name="tags" value={createForm.tags} onChange={handleCreateChange} fullWidth />

          <FormControlLabel
            control={<Switch checked={createForm.published} onChange={handleCreateChange} name="published" />}
            label="Published"
          />

          <input type="file" name="image" accept="image/*" onChange={handleCreateChange} />

          {createForm.image && (
            <Box className="mt-2">
              <Typography>Image Preview:</Typography>
              <img src={URL.createObjectURL(createForm.image)} alt="Preview" className="w-40 rounded-md mb-2" />
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCreateForm((prev) => ({ ...prev, image: null }))}
              >
                Remove Image
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleCreateBlog}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================== EDIT BLOG MODAL ====================== */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Edit Blog</DialogTitle>

        <DialogContent className="flex flex-col gap-3">

          <TextField label="Title" name="title" value={formData.title} onChange={handleFormChange} fullWidth />

          <TextField label="Slug" name="slug" value={formData.slug} onChange={handleFormChange} fullWidth />

          <TextField label="Author" name="author" value={formData.author} onChange={handleFormChange} fullWidth />

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
            control={<Switch checked={formData.published} onChange={handleFormChange} name="published" />}
            label="Published"
          />

          {currentBlog?.image && !formData.image && (
            <Box>
              <Typography>Current Image:</Typography>
              <img src={currentBlog.image} className="w-40 rounded-md mb-2" />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.clearImage}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        clearImage: !prev.clearImage,
                        image: null,
                      }))
                    }
                  />
                }
                label="Remove existing image"
              />
            </Box>
          )}

          {!formData.clearImage && (
            <input type="file" name="image" accept="image/*" onChange={handleFormChange} />
          )}

          {formData.image && (
            <Box className="mt-2">
              <Typography>New Image Preview:</Typography>
              <img src={URL.createObjectURL(formData.image)} className="w-40 rounded-md mb-2" />

              <Button
                variant="outlined"
                color="error"
                onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
              >
                Remove New Image
              </Button>
            </Box>
          )}
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
