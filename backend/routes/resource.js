import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Resource from "../models/Resource.js";

const router = express.Router();

// Enable CORS for frontend
router.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
dotenv.config();

/**
 * Create a new resource (admin only)
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Access denied" });
    }
    const newRes = new Resource(req.body);
    const saved = await newRes.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
});

/**
 * Get all resources (admin, doctor, nurse)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const allowed = ["Administrator", "Doctor", "Nurse"];
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const list = await Resource.find();
    res.status(200).json(list);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * Get a resource by ID
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }
    const resrc = await Resource.findById(id);
    if (!resrc) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(200).json(resrc);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * Update a resource by ID (admin, nurse)
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ["Administrator", "Nurse"];
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }
    const updated = await Resource.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
});

/**
 * Delete a resource by ID (admin only)
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }
    const deleted = await Resource.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.post("/:id/allocate", authenticateToken, async (req, res) => {
    try {
      const allowed = ['Administrator','Nurse'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
      const { id } = req.params;
      const { patientId } = req.body;
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid ID(s)' });
      }
      const resource = await Resource.findById(id);
      if (!resource) return res.status(404).json({ message: 'Resource not found' });
      resource.allocatedTo = patientId;
      resource.status = 'in-maintenance';
      await resource.save();
      res.status(200).json(resource);
    } catch (error) {
      console.error('Allocation error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
// Export the router
export default router;
