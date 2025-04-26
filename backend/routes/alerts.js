import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Alert from "../models/Alert.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

// allow only our React app to hit these endpoints
router.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


router.get("/", authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).lean();
    res.json(alerts);
  } catch (err) {
    console.error("Failed to fetch alerts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { message, source } = req.body;
    const alert = await Alert.create({ message, source });

    // broadcast to all connected clients
    const io = req.app.get("io");
    io.emit("alert", {
      _id: alert._id,
      message: alert.message,
      source: alert.source,
      timestamp: alert.timestamp,
    });

    res.status(201).json(alert);
  } catch (err) {
    console.error("Failed to create alert:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
