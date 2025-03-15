// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from './routes/emergencyPatients.js'; // Import emergency patients routes

dotenv.config();

const app = express();

connectDB(); // Connect to MongoDB

// *** CORS MUST BE FIRST ***
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from your frontend origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// THEN other middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// THEN your routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/", profileRoutes);
app.use('/api/emergency-patients', emergencyPatientRoutes); // Mount emergency patients routes at /api/emergency-patients

const PORT = process.env.PORT || 8089;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));