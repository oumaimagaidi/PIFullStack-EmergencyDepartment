import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import connectDB from "./db.js";

dotenv.config();

const app = express();

// ✅ Connexion à MongoDB
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // Autoriser uniquement cette origine
  credentials: true, // Permettre l'envoi des cookies
  methods: ["GET", "POST", "PUT", "DELETE"], // Autoriser ces méthodes
  allowedHeaders: ["Content-Type", "Authorization"], // Headers autorisés
}));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ✅ Lancement du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));