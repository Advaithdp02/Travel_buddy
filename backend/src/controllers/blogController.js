import Blog from "../models/Blog.js";
import { uploadToS3, deleteFromS3 } from "./uploadController.js";

// Helper to get folder name for S3
const getBlogFolder = (title) => `blogs/${title.replace(/\s+/g, "_")}`;

// Create a blog
export const createBlog = async (req, res) => {
  try {
    const { title, slug, content, tags, published, author } = req.body;

    let image = null;
    if (req.file) {
      const folderName = getBlogFolder(title);
      image = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        folderName,
        req.file.mimetype
      );
    }

    const blog = new Blog({
      title,
      slug,
      content,
      tags,
      published: published || false,
      image,
      author, // now a simple string
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error("Create Blog Error:", err);
    res.status(500).json({ message: "Failed to create blog" });
  }
};


// Update a blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const { title, slug, content, tags, published, clearImage, author } = req.body;

    // Update fields
    if (title !== undefined) blog.title = title;
    if (slug !== undefined) blog.slug = slug;
    if (content !== undefined) blog.content = content;
    if (tags !== undefined) blog.tags = tags.split(",");
    if (published !== undefined) blog.published = published;
    if (author !== undefined) blog.author = author;

    // ------------------- IMAGE LOGIC -------------------

    // 1️⃣ If user uploaded a new image → delete old & replace
    if (req.file) {
      if (blog.image) {
        await deleteFromS3(blog.image);
      }

      const folderName = getBlogFolder(blog.title);
      blog.image = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        folderName,
        req.file.mimetype
      );
    }

    // 2️⃣ If user selected "remove image"
    if (!req.file && clearImage === "true") {
      if (blog.image) {
        await deleteFromS3(blog.image);
      }
      blog.image = null;
    }

    // ------------------- END IMAGE LOGIC -------------------

    await blog.save();
    res.json(blog);

  } catch (err) {
    console.error("Update Blog Error:", err);
    res.status(500).json({ message: "Failed to update blog" });
  }
};





// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Authorization: only author or admin
    if (!req.user || (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete image from S3 if exists
    if (blog.image) {
      try {
        await deleteFromS3(blog.image);
      } catch (err) {
        console.error("Failed to delete S3 image:", err);
      }
    }

    // Delete the blog
    await Blog.findByIdAndDelete(blog._id);

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ message: "Failed to delete blog", error: err.message });
  }
};



// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name username").sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Get single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate("author", "name username");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};
