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
import alertsRoutes from "./routes/alerts.js";        // ← new

import Ambulance from "./models/Ambulance.js";
import Alert from "./models/Alert.js";                // ← new

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
app.use("/api/alerts", alertsRoutes);                // ← new

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

// make io accessible in routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡️ Socket connected:", socket.id);

  // Location updates
  socket.on("locationUpdate", async (data) => {
    console.log("📍 locationUpdate received:", data);
    try {
      await Ambulance.findByIdAndUpdate(data.id, {
        latitude: data.latitude,
        longitude: data.longitude,
        lastUpdated: data.timestamp,
      });
      console.log("📍 Location saved for ambulance:", data.id);
    } catch (err) {
      console.error("Error saving location:", err);
    }
    io.emit("locationUpdate", data);
  });

  // Destination updates
  socket.on("destinationUpdate", async (data) => {
    console.log("🏁 destinationUpdate received:", data);
    try {
      const destinationString = `${data.destinationLatitude},${data.destinationLongitude}`;
      await Ambulance.findByIdAndUpdate(data.id, {
        destination: destinationString,
        lastUpdated: Date.now(),
      });
      console.log("🏁 Destination saved for ambulance:", data.id);
    } catch (err) {
      console.error("Error saving destination:", err);
    }
    io.emit("destinationUpdate", data);
  });

  // New: Ambulance alerts via socket
  socket.on("alert", async ({ message, source }) => {
    console.log("🔔 alert received via socket:", message, source);
    try {
      const alert = await Alert.create({ message, source });
      io.emit("alert", {
        _id: alert._id,
        message: alert.message,
        source: alert.source,
        timestamp: alert.timestamp,
      });
    } catch (err) {
      console.error("Error saving alert:", err);
    }
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
