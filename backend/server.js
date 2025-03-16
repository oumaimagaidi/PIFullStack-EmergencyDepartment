import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from "./routes/emergencyPatients.js";
import botRoutes from "./routes/bot.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files for uploaded images
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadsDir}`);
}
app.use("/uploads", express.static(uploadsDir));

// Check directory permissions
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log(`Uploads directory ${uploadsDir} is writable`);
} catch (err) {
  console.error(`Uploads directory ${uploadsDir} is not writable:`, err.message);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Auth header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  if (!token) {
    console.log("No token provided, rejecting request");
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    console.log("Token decoded successfully:", decoded);
    req.user = decoded && decoded.role ? decoded : { role: null };
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(403).json({ success: false, message: "Invalid or expired token", error: error.message });
  }
};

// Log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url} from ${req.ip}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/emergency-patients", emergencyPatientRoutes);
app.use("/api/bot", botRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ success: false, message: "Server error", error: err.message });
});

// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 8089;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log("Available routes:");
  console.log("- /api/auth");
  console.log("- /api/users");
  console.log("- /api/profiles");
  console.log("- /api/emergency-patients");
  console.log("- /api/bot");
});

export default app;