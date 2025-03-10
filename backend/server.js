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
import emergencyPatientRoutes from './routes/emergencyPatients.js';

dotenv.config();

const app = express();

connectDB();

// *** CORS MUST BE FIRST ***
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// THEN other middleware
app.use(express.json());
app.use(cookieParser());


// THEN your routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/", profileRoutes);
app.use('/api/emergency-patients', emergencyPatientRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));