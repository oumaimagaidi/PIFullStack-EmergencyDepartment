import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io"; // Use the alias you defined
import jwt from 'jsonwebtoken'; // Keep JWT import
import ocrRouter from "./routes/ocr.js"
import connectDB from "./db.js";

// Route Imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from "./routes/emergencyPatients.js";
import aiRoutes from "./routes/ai.js";
import ambulanceRoutes from "./routes/ambulance.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import patientFileRoutes from "./routes/patientFile.js";
import alertsRoutes from "./routes/alerts.js";
import notificationRoutes from './routes/notifications.js';

// --- Model Imports ---
import annotationsRoutes from "./routes/annotation.js";
import archiveRoutes from "./routes/archive.js";
import ambulanceRequestRoutes from "./routes/ambulanceRequests.js";
import { User } from "./models/User.js";
import Ambulance from "./models/Ambulance.js";
import AmbulanceRequest from "./models/AmbulanceRequest.js";
import Resource from "./routes/resource.js";
import Alert from "./models/Alert.js";
import patientRoutes from "./routes/patient.js";
import ocrRouter from "./routes/ocr.js";

import Feedback from "./models/FeedBack.js";
import feedbackRoutes from "./routes/feedback.js";
import { User } from "./models/User.js";
import Ambulance from "./models/Ambulance.js";
import Alert from "./models/Alert.js";
import Resource from "./routes/resource.js";
import patientRoutes from "./routes/patient.js"

// --- Helpers ---
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

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"," PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files from 'Uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Attach io and userSockets to request object
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", profileRoutes);
app.use("/api/emergency-patients", emergencyPatientRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/ambulance-requests", ambulanceRequestRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/patient-files", patientFileRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/annotations", annotationsRoutes);
app.use("/api/archive", archiveRoutes);
app.use("/api/resources", Resource);
app.use("/api/ocr", ocrRouter);
app.use("/api/patients", patientRoutes);
app.use("/api/ai", aiRoutes); // Note: Remove duplicate aiRoutes entries

// Socket.IO Authentication Middleware
app.use("/api/resources",Resource );
app.use('/api/ocr', ocrRouter); // Mount the router under /api/ocr
app.use('/api/patients',patientRoutes );
app.use('/api/feedback',feedbackRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes); 

// --- ✨ Socket.IO Authentication Middleware ---
io.use((socket, next) => {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.cookie?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  if (!token) {
    console.error("❌ Socket Auth Error: No token provided");
    return next(new Error("Authentication error: No token"));
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = verified.id;
    socket.userRole = verified.role;
    console.log(`🔒 Socket authenticated: User ${socket.userId} (${socket.userRole})`);
    next();
  } catch (error) {
    console.error("❌ Socket Auth Error: Invalid token -", error.message);
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO Connection Logic
io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id} for User ID: ${socket.userId} (${socket.userRole})`);

  // Associate userId with socket
  if (socket.userId) {
    userSockets.set(socket.userId.toString(), socket.id);
    console.log(`🗺️ User ${socket.userId} mapped to socket ${socket.id}`);
  } else {
    console.warn(`⚠️ Socket ${socket.id} connected without a valid userId after authentication.`);
  }

  // Join Role-Based Rooms
  if (socket.userRole) {
    const roomName = `${socket.userRole.toLowerCase()}-room`;
    socket.join(roomName);
    console.log(`🚪 Socket ${socket.id} (User ${socket.userId}) joined room: ${roomName}`);
    socket.join(`user_${socket.userId}`);
    console.log(`🚪 Socket ${socket.id} (User ${socket.userId}) joined personal room: user_${socket.userId}`);
  }

  // Ambulance location update
  socket.on("locationUpdate", async (data) => {
    console.log("Received locationUpdate:", data);
    if (!data || !data.id || data.latitude == null || data.longitude == null) {
      console.error("Invalid locationUpdate data received:", data);
      return;
    }
    try {
      await Ambulance.findByIdAndUpdate(data.id, {
        latitude: data.latitude,
        longitude: data.longitude,
        lastUpdated: data.timestamp || new Date(),
      });
      io.emit(`ambulance_${data.id}`, {
        type: "LOCATION_UPDATE",
        data: { latitude: data.latitude, longitude: data.longitude },
      });
    } catch (err) {
      console.error("❌ Error saving location:", err);
    }
  });

  // Ambulance destination update
  socket.on("destinationUpdate", async (data) => {
    console.log("Received destinationUpdate:", data);
    if (!data || !data.id || data.destinationLatitude == null || data.destinationLongitude == null) {
      console.error("Invalid destinationUpdate data received:", data);
      return;
    }
    try {
      const destination = `${data.destinationLatitude},${data.destinationLongitude}`;
      await Ambulance.findByIdAndUpdate(data.id, {
        destination,
        lastUpdated: Date.now(),
      });
      io.emit("destinationUpdate", data);
    } catch (err) {
      console.error("❌ Error saving destination:", err);
    }
  });

  // Patient location update (from socketManager.js)
  socket.on("updatePatientLocation", async (data) => {
    try {
      const { requestId, latitude, longitude } = data;
      const request = await AmbulanceRequest.findById(requestId);
      if (request) {
        request.patient.location = { latitude, longitude };
        await request.save();

        const ambulance = await Ambulance.findById(request.ambulance);
        if (ambulance) {
          ambulance.destination = `${latitude},${longitude}`;
          await ambulance.save();

          io.emit(`ambulance_${ambulance._id}`, {
            type: "LOCATION_UPDATE",
            data: { latitude, longitude },
          });
        }
      }
    } catch (error) {
      console.error("Error updating patient location:", error);
    }
  });

  // New ambulance request (from socketManager.js)
  socket.on("newAmbulanceRequest", async (data) => {
    try {
      const request = await AmbulanceRequest.create(data);
      const ambulance = await Ambulance.findOne({ status: "AVAILABLE" });
      if (ambulance) {
        request.ambulance = ambulance._id;
        request.status = "ACCEPTED";
        await request.save();

        ambulance.status = "ON_MISSION";
        ambulance.destination = `${request.patient.location.latitude},${request.patient.location.longitude}`;
        await ambulance.save();

        io.emit("ambulanceRequestUpdate", {
          type: "NEW_REQUEST",
          data: request,
        });

        io.emit(`ambulance_${ambulance._id}`, {
          type: "NEW_MISSION",
          data: request,
        });
      }
    } catch (error) {
      console.error("Error creating ambulance request:", error);
    }
  });

  // Ambulance alert
  socket.on("alert", async ({ message, source }) => {
    console.log("Received alert:", { message, source });
    if (!message || !source) {
      console.error("Invalid alert data received:", { message, source });
      return;
    }
    try {
      const alert = await Alert.create({ message, source });
      io.emit("alert", {
        _id: alert._id,
        message: alert.message,
        source: alert.source,
        timestamp: alert.timestamp,
      });
    } catch (err) {
      console.error("❌ Error saving alert:", err);
    }
  });

  // Ping-pong test
  socket.on("ping_server", (data) => {
    console.log("Received ping_server from:", socket.id, data);
    socket.emit("pong_client", {
      message: "Pong from server!",
      timestamp: Date.now(),
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔥 Socket disconnected: ${socket.id}. Reason: ${reason}`);
    if (socket.userId) {
      if (userSockets.get(socket.userId.toString()) === socket.id) {
        userSockets.delete(socket.userId.toString());
        console.log(`🗺️ User ${socket.userId} removed from socket map.`);
      }
    }
    for (let [key, value] of userSockets.entries()) {
      if (value === socket.id) {
        userSockets.delete(key);
        console.log(`🗺️ Cleaned up map entry for disconnected socket ${socket.id}`);
        break;
      }
    }
  });
});

// Server Listen
const PORT = process.env.PORT || 8089;
server.listen(PORT, () => {
  console.log(`✅ Server (with Socket.IO) running on port ${PORT}`);
});