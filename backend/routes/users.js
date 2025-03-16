import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js"; // Assuming User model exists
import { authenticateToken } from "../middleware/authMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";
import { 
  uploadImage, 
  getAllDoctors, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} from "../controllers/doctorController.js"; // Import doctor controller functions
import { uploadImage as uploadDonatorImage, getAllDonators, createDonator } from "../controllers/donatorController.js"; // Import donator controller functions

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();

// Obtenir tous les utilisateurs (admin uniquement)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const users = await User.find();
    res.status(200).json({ success: true, message: "Users retrieved successfully", users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Obtenir un utilisateur par ID
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ success: true, message: "User retrieved successfully", user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Mettre à jour un utilisateur
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (!req.user || (req.user.id !== req.params.id && req.user.role !== "Administrator")) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Supprimer un utilisateur (admin uniquement)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Route de validation d'utilisateur (admin uniquement)
router.post("/validate-user", authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });

    user.isValidated = true;
    await user.save();

    res.status(200).json({ success: true, message: "Utilisateur validé avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

router.get("/patients/count", authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patientCount = await User.countDocuments({ role: "Patient" });
    res.status(200).json({ success: true, message: "Patient count retrieved", count: patientCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

router.get("/patients", authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.role || !["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      console.log("User role check failed:", req.user);
      return res.status(403).json({ success: false, message: "Access denied. Only administrators, doctors, or nurses can view patients." });
    }

    const patients = await User.find({ role: "Patient" }).exec();
    console.log("Fetched patients:", patients);

    if (!patients || patients.length === 0) {
      return res.status(404).json({ success: false, message: "Aucun patient trouvé" });
    }

    res.status(200).json({ success: true, message: "Patients retrieved successfully", patients });
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Delete a patient (admin only)
router.delete("/patients/:id", authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== "Patient") {
      return res.status(404).json({ success: false, message: "Patient non trouvé" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Patient supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du patient:", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Update a patient (admin only)
router.put("/patients/:id", authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== "Patient") {
      return res.status(404).json({ success: false, message: "Patient non trouvé" });
    }

    const updatedPatient = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Patient updated successfully", patient: updatedPatient });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du patient:", error);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
});

// Doctor routes
router.get("/doctors", authenticateToken, getAllDoctors);
router.post("/doctors", authenticateToken, uploadImage, createDoctor);
router.put("/doctors/:id", authenticateToken, uploadImage, updateDoctor);
router.delete("/doctors/:id", authenticateToken, deleteDoctor);

// Donator routes
router.get("/donators", authenticateToken, getAllDonators);
router.post("/donators", authenticateToken, uploadDonatorImage, createDonator);

export default router;