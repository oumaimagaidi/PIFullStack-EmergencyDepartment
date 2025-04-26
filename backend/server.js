import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { Server as SocketIOServer } from "socket.io";

import connectDB from "./db.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from "./routes/emergencyPatients.js";
import ambulanceRoutes from "./routes/ambulance.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import patientFileRoutes from "./routes/patientFile.js";
import alertsRoutes from "./routes/alerts.js";
import SharedMedicalRecord from "./models/SharedMedicalRecord.js"; // Add new model
import AuditLog from "./models/AuditLog.js"; // Add audit log model
import { User } from "./models/User.js";
import Ambulance from "./models/Ambulance.js";
import Alert from "./models/Alert.js";
import annotationsRoutes from "./routes/annotation.js"
import archiveRoutes from "./routes/archive.js"

// Helpers
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// User-socket mapping
const userSockets = new Map();
global.io = io;
global.userSockets = userSockets;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", profileRoutes);
app.use("/api/emergency-patients", emergencyPatientRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/patient-files", patientFileRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/annotations", annotationsRoutes)
app.use("/api/archive", archiveRoutes)
// Socket.IO logic
io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Associate userId with socket
  const userId = socket.handshake.query.userId;
  if (userId && userId !== 'undefined' && userId !== 'null') {
    userSockets.set(userId.toString(), socket.id);
    User.findById(userId).select("role").then(user => {
      if (user?.role) {
        const roomName = `${user.role.toLowerCase()}-room`;
        socket.join(roomName);
        console.log(`🚪 Socket ${socket.id} joined room: ${roomName}`);
      }
    }).catch(err => console.error("❌ Error fetching user role:", err));
  }

  // Ambulance location update
  socket.on("locationUpdate", async (data) => {
    try {
      await Ambulance.findByIdAndUpdate(data.id, {
        latitude: data.latitude,
        longitude: data.longitude,
        lastUpdated: data.timestamp,
      });
      io.emit("locationUpdate", data);
    } catch (err) {
      console.error("Error saving location:", err);
    }
  });

  // Ambulance destination update
  socket.on("destinationUpdate", async (data) => {
    try {
      const destination = `${data.destinationLatitude},${data.destinationLongitude}`;
      await Ambulance.findByIdAndUpdate(data.id, {
        destination,
        lastUpdated: Date.now(),
      });
      io.emit("destinationUpdate", data);
    } catch (err) {
      console.error("Error saving destination:", err);
    }
  });

  // Ambulance alert
  socket.on("alert", async ({ message, source }) => {
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

  // Ping-pong test
  socket.on("ping_server", (data) => {
    socket.emit("pong_client", {
      message: "Pong from server!",
      timestamp: Date.now(),
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔥 Socket disconnected: ${socket.id}. Reason: ${reason}`);
    for (let [key, value] of userSockets.entries()) {
      if (value === socket.id) {
        userSockets.delete(key);
        break;
      }
    }
  });
});

// Server listen
const PORT = process.env.PORT || 8089;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
