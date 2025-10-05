import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import districtRoutes from "./routes/districtRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));


app.get("/", (req, res) => {
  res.json({ message: "Travel App Backend Running 🚀" });
});
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/districts", districtRoutes);


export default app;
