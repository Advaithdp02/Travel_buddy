import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";


const PORT = process.env.PORT || 3000;
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", PORT);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
