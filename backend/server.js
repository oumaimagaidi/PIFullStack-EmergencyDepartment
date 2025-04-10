// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http';             // 1. Import Node's built-in http module
import { Server as SocketIOServer } from "socket.io"; // 1. Import Socket.IO Server (renamed to avoid conflict)
import path from 'path';              // 1. Import path for serving static files
import { fileURLToPath } from 'url';  // 1. Helper for ES Modules __dirname equivalent

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import connectDB from "./db.js";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profile.js";
import emergencyPatientRoutes from './routes/emergencyPatients.js';
import { User } from "./models/User.js"; // 1. Import User model

dotenv.config();

const app = express();
const server = http.createServer(app); // 2. Create an HTTP server from the Express app

// Helper to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Initialize Socket.IO Server
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your frontend origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 4. Implement User-Socket Mapping (In-memory - consider Redis for production)
const userSockets = new Map(); // Map: userId -> socketId

// 5. Make io and userSockets globally accessible (simplest approach for this example)
// Consider dependency injection or middleware for more complex apps
global.io = io;
global.userSockets = userSockets;

connectDB(); // Connect to MongoDB

// --- Middleware ---
// CORS must be configured BEFORE routes
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// 7. Serve uploaded static files (e.g., profile images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/", profileRoutes);
app.use('/api/emergency-patients', emergencyPatientRoutes);

// --- 6. Socket.IO Connection Logic ---
io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Get userId from the handshake query (sent by frontend)
    const userId = socket.handshake.query.userId;

    if (userId && userId !== 'undefined' && userId !== 'null') {
        console.log(`🔗 Associating userId ${userId} with socket ${socket.id}`);
        userSockets.set(userId.toString(), socket.id); // Store userId -> socketId mapping

        // Attempt to add user to role-based room
        User.findById(userId).select('role').then(user => {
            if (user && user.role) {
                const roomName = `${user.role.toLowerCase()}-room`;
                socket.join(roomName);
                console.log(`🚪 Socket ${socket.id} (User ${userId}) joined room: ${roomName}`);
            } else {
                 console.log(`❓ User ${userId} found but no role specified for room joining.`);
            }
        }).catch(err => console.error(`❌ Error fetching user role for socket ${socket.id} (User ${userId}):`, err));

    } else {
        console.warn(`⚠️ Socket ${socket.id} connected without a valid userId.`);
    }

    socket.on('disconnect', (reason) => {
        console.log(`🔥 Socket disconnected: ${socket.id}. Reason: ${reason}`);
        // Clean up the mapping on disconnect
        for (let [key, value] of userSockets.entries()) {
            if (value === socket.id) {
                userSockets.delete(key);
                console.log(`🧹 Removed mapping for disconnected userId ${key} (Socket ${socket.id})`);
                break;
            }
        }
    });

    // Example listener for debugging or simple chat
    socket.on('ping_server', (data) => {
        console.log(`Received ping from ${socket.id}:`, data);
        socket.emit('pong_client', { message: 'Pong from server!', timestamp: Date.now() });
    });

});
// --- End Socket.IO Logic ---

const PORT = process.env.PORT || 8089;

// 8. Start the HTTP server (which now includes Socket.IO)
server.listen(PORT, () => console.log(`✅ Server (with Socket.IO) running on port ${PORT}`));