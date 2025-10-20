import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import districtRoutes from "./routes/districtRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import trackRoutes from "./routes/trackRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
// Create app
const app = express();

// --------------------
// MIDDLEWARES
// --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// --------------------
// BASE ROUTE
// --------------------
app.get("/", (req, res) => {
  res.json({ message: "Travel App Backend Running 🚀" });
});

// --------------------
// ROUTES
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/track", trackRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/blogs', blogRoutes);
app.use("/api/contact", contactRoutes);
// --------------------
// 404 HANDLER
// --------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: err.message || "Server Error" });
});

export default app;
