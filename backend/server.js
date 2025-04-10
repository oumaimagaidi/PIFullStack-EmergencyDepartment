// backend/server.js
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { Server as IOServer } from "socket.io";

import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from "./routes/emergencyPatients.js";
import ambulanceRoutes from "./routes/ambulance.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import patientFileRoutes from "./routes/patientFile.js";

// Import the Ambulance model (adjust the path according to your project structure)
import Ambulance from "./models/Ambulance.js";

dotenv.config();
connectDB();

const app = express();

// CORS (must be before anything else)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// REST routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", profileRoutes);
app.use("/api/emergency-patients", emergencyPatientRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/patient-files", patientFileRoutes);

// Create a single HTTP server from Express
const server = http.createServer(app);

// Attach Socket.IO to that server
const io = new IOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡️ Socket connected:", socket.id);

  socket.on("locationUpdate", async (data) => {
    console.log("📍 locationUpdate received:", data);
    try {
      // Update the corresponding ambulance record with new location and last updated timestamp
      await Ambulance.findByIdAndUpdate(data.id, {
        latitude: data.latitude,
        longitude: data.longitude,
        lastUpdated: data.timestamp,
      });
      console.log("📍 Location saved to database for ambulance:", data.id);
    } catch (err) {
      console.error("Error saving location to database:", err);
    }
    // Emit the location update to all connected clients
    io.emit("locationUpdate", data);
    console.log("📍 locationUpdate emitted:", data);
  });
  socket.on("destinationUpdate", async (data) => {
    console.log("🏁 destinationUpdate received:", data);
    try {
      // Format destination as "latitude,longitude" string
      const destinationString = `${data.destinationLatitude},${data.destinationLongitude}`;
      
      // Update the ambulance with the destination string
      await Ambulance.findByIdAndUpdate(data.id, {
        destination: destinationString,
        lastUpdated: Date.now(),
      });
      console.log("🏁 Destination saved to database for ambulance:", data.id);
    } catch (err) {
      console.error("Error saving destination to database:", err);
    }
    
    // Emit the destination update to all connected clients
    io.emit("destinationUpdate", data);
    console.log("🏁 destinationUpdate emitted:", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Listen on the HTTP+Socket.IO server
const PORT = process.env.PORT || 8089;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
