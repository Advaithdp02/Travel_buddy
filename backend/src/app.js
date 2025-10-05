import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Routes
import userRoutes from "./routes/userRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import districtRoutes from "./routes/districtRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

// --------------------
// MIDDLEWARES
// --------------------
app.use(cors());
app.use(express.json());          // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(cookieParser());          // Parse cookies
app.use(morgan("combined"));      // Logging HTTP requests

// --------------------
// BASE ROUTE
// --------------------
app.get("/", (req, res) => {
  res.json({ message: "Travel App Backend Running 🚀" });
});

// --------------------
// API ROUTES
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/comments", commentRoutes);

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
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server Error" });
});

export default app;