import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http'; // Keep only one http import
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io"; // Use the alias you defined
import jwt from 'jsonwebtoken'; // Keep JWT import
import connectDB from "./db.js";

// --- Route Imports ---
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from "./routes/emergencyPatients.js";
import aiRoutes from './routes/ai.js';
import ambulanceRoutes from "./routes/ambulance.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import patientFileRoutes from "./routes/patientFile.js";
import alertsRoutes from "./routes/alerts.js";
import annotationsRoutes from "./routes/annotation.js";
import archiveRoutes from "./routes/archive.js";

import { User } from "./models/User.js";
import Ambulance from "./models/Ambulance.js";
import Resource from "./routes/resource.js";
import Alert from "./models/Alert.js";
import ocrRouter from './routes/ocr.js'; // Adjust the path as needed
// --- Helpers ---
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Use the http server instance

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initialize Socket.IO server ---
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true, // Important for passing cookies
  },
});

// --- User-socket mapping ---
const userSockets = new Map(); // Use Map for better performance
// Make io and userSockets globally accessible if needed by other modules not using req object
// global.io = io;
// global.userSockets = userSockets;

// --- Middleware ---
app.use(cors({ // Ensure CORS is first
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ✨ Middleware to attach io and userSockets to request object ---
// This makes them easily accessible in your route handlers
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});
// --- End Middleware ---

// --- REST API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", profileRoutes);
app.use("/api/emergency-patients", emergencyPatientRoutes); // Ensure this uses req.io
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/patient-files", patientFileRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/annotations", annotationsRoutes);
app.use("/api/archive", archiveRoutes);
app.use("/api/resources",Resource );
app.use('/api/ocr', ocrRouter); // Mount the router under /api/ocr

app.use('/api/ai', aiRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/ai', aiRoutes);

// --- ✨ Socket.IO Authentication Middleware ---
io.use((socket, next) => {
  // Extract token from handshake auth or cookies
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  if (!token) {
    console.error("❌ Socket Auth Error: No token provided");
    return next(new Error('Authentication error: No token'));
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = verified.id; // Attach userId to socket
    socket.userRole = verified.role; // Attach userRole to socket
    console.log(`🔒 Socket authenticated: User ${socket.userId} (${socket.userRole})`);
    next(); // Proceed to connection
  } catch (error) {
    console.error("❌ Socket Auth Error: Invalid token -", error.message);
    return next(new Error('Authentication error: Invalid token'));
  }
});
// --- End Socket.IO Auth Middleware ---

// --- Socket.IO Connection Logic ---
io.on("connection", (socket) => {
  // This now runs *after* the io.use middleware authentication
  console.log(`⚡ Socket connected: ${socket.id} for User ID: ${socket.userId} (${socket.userRole})`);

  // --- Associate userId with socket ---
  // Ensure userId is valid before adding to map
  if (socket.userId) {
    userSockets.set(socket.userId.toString(), socket.id);
    console.log(`🗺️ User ${socket.userId} mapped to socket ${socket.id}`);
  } else {
    console.warn(`⚠️ Socket ${socket.id} connected without a valid userId after authentication.`);
    // Optionally disconnect if userId is absolutely required
    // socket.disconnect(true);
    // return;
  }

  // --- ✨ Join Role-Based Rooms ---
  if (socket.userRole) {
    const roomName = `${socket.userRole.toLowerCase()}-room`; // e.g., 'nurse-room', 'doctor-room'
    socket.join(roomName);
    console.log(`🚪 Socket ${socket.id} (User ${socket.userId}) joined room: ${roomName}`);

    // Optionally join a user-specific room too
    socket.join(`user_${socket.userId}`);
    console.log(`🚪 Socket ${socket.id} (User ${socket.userId}) joined personal room: user_${socket.userId}`);
  }
  // --- End Room Joining ---

  // --- Keep Existing Event Listeners ---
  // Ambulance location update
  socket.on("locationUpdate", async (data) => {
    console.log("Received locationUpdate:", data); // Debug log
    if (!data || !data.id || data.latitude == null || data.longitude == null) {
      console.error("Invalid locationUpdate data received:", data);
      return; // Prevent processing invalid data
    }
    try {
      await Ambulance.findByIdAndUpdate(data.id, {
        latitude: data.latitude,
        longitude: data.longitude,
        lastUpdated: data.timestamp || new Date(), // Ensure timestamp exists
      });
      // Emit back to all clients (consider specific room/client if needed)
      io.emit("locationUpdate", data);
    } catch (err) {
      console.error("❌ Error saving location:", err);
    }
  });

  // Ambulance destination update
  socket.on("destinationUpdate", async (data) => {
    console.log("Received destinationUpdate:", data); // Debug log
    if (!data || !data.id || data.destinationLatitude == null || data.destinationLongitude == null) {
      console.error("Invalid destinationUpdate data received:", data);
      return; // Prevent processing invalid data
    }
    try {
      const destination = `${data.destinationLatitude},${data.destinationLongitude}`;
      await Ambulance.findByIdAndUpdate(data.id, {
        destination,
        lastUpdated: Date.now(),
      });
      // Emit back to all clients (consider specific room/client if needed)
      io.emit("destinationUpdate", data);
    } catch (err) {
      console.error("❌ Error saving destination:", err);
    }
  });

  // Ambulance alert
  socket.on("alert", async ({ message, source }) => {
    console.log("Received alert:", { message, source }); // Debug log
    if (!message || !source) {
      console.error("Invalid alert data received:", { message, source });
      return; // Prevent processing invalid data
    }
    try {
      const alert = await Alert.create({ message, source });
      // Emit back to all clients (consider specific room/client if needed)
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
    console.log("Received ping_server from:", socket.id, data); // Debug log
    socket.emit("pong_client", {
      message: "Pong from server!",
      timestamp: Date.now(),
    });
  });
  // --- End Existing Event Listeners ---

  socket.on("disconnect", (reason) => {
    console.log(`🔥 Socket disconnected: ${socket.id}. Reason: ${reason}`);
    // Remove the user from the map upon disconnection
    if (socket.userId) {
      // Check if the disconnected socket ID matches the stored ID for that user
      if (userSockets.get(socket.userId.toString()) === socket.id) {
        userSockets.delete(socket.userId.toString());
        console.log(`🗺️ User ${socket.userId} removed from socket map.`);
      }
    }
    // Fallback: Clean up any socket ID entry just in case mapping got skewed
    for (let [key, value] of userSockets.entries()) {
      if (value === socket.id) {
        userSockets.delete(key);
        console.log(`🗺️ Cleaned up map entry for disconnected socket ${socket.id}`);
        break; // Exit loop once found
      }
    }
  });
});
// --- End Socket.IO Logic ---

// --- Server Listen ---
const PORT = process.env.PORT || 8089;
server.listen(PORT, () => { // Use the http server instance
  console.log(`✅ Server (with Socket.IO) running on port ${PORT}`);
});