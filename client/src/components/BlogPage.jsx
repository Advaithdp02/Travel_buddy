import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Alert, Chip } from "@mui/material";
import { YellowCalendar, YellowPerson } from "../components/icons";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const BlogPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/blogs/${slug}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Failed to load blog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

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

  if (!blog) return <p className="text-center py-10">Blog not found.</p>;

  return (
    <Box className="max-w-4xl mx-auto p-6">
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-[400px] object-cover rounded-lg mb-6"
        />
      )}
      <Typography variant="h3" className="font-bold mb-4">
        {blog.title}
      </Typography>

      <Box className="flex gap-4 text-[#6D6969] mb-4 text-sm">
        <span className="flex items-center gap-1 text-[#F2B024]">
          <YellowPerson /> {blog.author?.name || "Unknown"}
        </span>
        <span className="flex items-center gap-1 text-[#F2B024]">
          <YellowCalendar /> {new Date(blog.createdAt).toLocaleDateString()}
        </span>
      </Box>

      {blog.tags && blog.tags.length > 0 && (
        <Box className="flex gap-2 mb-4 flex-wrap">
          {blog.tags.map((tag, i) => (
            <Chip key={i} label={tag} size="small" color="primary" />
          ))}
        </Box>
      )}

      <Typography variant="body1" className="text-gray-700 leading-7">
        {blog.content}
      </Typography>
    </Box>
  );
};
