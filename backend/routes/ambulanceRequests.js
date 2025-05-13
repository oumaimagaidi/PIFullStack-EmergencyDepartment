import express from "express";
import AmbulanceRequest from "../models/AmbulanceRequest.js";
import Ambulance from "../models/Ambulance.js";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

dotenv.config();
// Enable CORS for React front-end
router.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
  })
);
/**
 * Create a new ambulance request (unauthenticated patients allowed)
 */
router.post("/", async (req, res) => {
  try {
    const request = await AmbulanceRequest.create({
      ...req.body,
      ambulance: null,
      status: "PENDING",
    });

    req.io.emit("ambulanceRequestUpdate", {
      type: "NEW_REQUEST",
      data: request,
    });

    return res.status(201).json(request);
  } catch (error) {
    console.error("Error creating ambulance request:", error);
    return res.status(500).json({ message: "Error creating ambulance request" });
  }
});

/**
 * Assign an ambulance to a request and set patient location (protected)
 */
router.patch("/:id/assign", authenticateToken, async (req, res) => {
  console.log("🚑 Assign request received:", req.body);
  const { ambulanceId, patientLocation } = req.body;
  try {
    const request = await AmbulanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance || ambulance.status !== "AVAILABLE") {
      return res.status(400).json({ message: "Ambulance not available" });
    }

    request.ambulance = ambulance._id;
    request.patient.location = patientLocation;
    request.status = "ACCEPTED";
    await request.save();

    ambulance.status = "ON_MISSION";
    ambulance.destination = `${patientLocation.latitude},${patientLocation.longitude}`;
    await ambulance.save();

    // Notify front-end and ambulance socket
    req.io.emit(`ambulance_${ambulance._id}`, {
      type: "NEW_MISSION",
      data: request,
    });
    req.io.emit("destinationUpdate", {
      id: ambulance._id,
      destinationLatitude: patientLocation.latitude,
      destinationLongitude: patientLocation.longitude,
    });

    return res.json(request);
  } catch (error) {
    console.error("Error assigning ambulance:", error);
    return res.status(500).json({ message: "Error assigning ambulance" });
  }
});

/**
 * List all ambulance requests (protected)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const requests = await AmbulanceRequest.find()
      .populate("ambulance")
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    console.error("Error fetching ambulance requests:", error);
    return res.status(500).json({ message: "Error fetching ambulance requests" });
  }
});

/**
 * Get single ambulance request by ID (protected)
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const request = await AmbulanceRequest.findById(req.params.id).populate("ambulance");
    if (!request) return res.status(404).json({ message: "Request not found" });
    return res.json(request);
  } catch (error) {
    console.error("Error fetching ambulance request:", error);
    return res.status(500).json({ message: "Error fetching ambulance request" });
  }
});

/**
 * Update status of an ambulance request (protected)
 */
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await AmbulanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    await request.save();

    // If completed, free up ambulance
    if (status === "COMPLETED" && request.ambulance) {
      const ambulance = await Ambulance.findById(request.ambulance);
      if (ambulance) {
        ambulance.status = "AVAILABLE";
        ambulance.destination = null;
        await ambulance.save();
      }
    }

    req.io.emit(`request_${request._id}`, {
      type: "STATUS_UPDATE",
      data: { status },
    });

    return res.json(request);
  } catch (error) {
    console.error("Error updating request status:", error);
    return res.status(500).json({ message: "Error updating request status" });
  }
});

export default router;
