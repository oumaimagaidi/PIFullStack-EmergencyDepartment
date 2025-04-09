import express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "../middleware/authMiddleware.js";
import PatientFile from "../models/PatientFile.js";
import MedicalRecord from "../models/MedicalRecord.js";

const router = express.Router();

// Créer un PatientFile (associé à un MedicalRecord)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { medicalRecordId, type, details, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
      return res.status(400).json({ message: "ID dossier médical invalide" });
    }

    // Vérifier que le MedicalRecord existe
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    const patientFile = new PatientFile({
      medicalRecord: medicalRecordId,
      creator: req.user._id,
      type,
      details,
      notes
    });

    await patientFile.save();

    res.status(201).json(patientFile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Récupérer tous les PatientFiles d'un MedicalRecord
router.get("/medical-record/:medicalRecordId", authenticateToken, async (req, res) => {
  try {
    const { medicalRecordId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
      return res.status(400).json({ message: "ID dossier médical invalide" });
    }

    const files = await PatientFile.find({ medicalRecord: medicalRecordId })
      .sort({ dateRecorded: -1 })
      .populate('creator', 'username');

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Récupérer un PatientFile spécifique
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const file = await PatientFile.findById(id).populate('creator', 'username');

    if (!file) {
      return res.status(404).json({ message: "Fichier patient non trouvé" });
    }

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Mettre à jour un PatientFile
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const updatedFile = await PatientFile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedFile) {
      return res.status(404).json({ message: "Fichier patient non trouvé" });
    }

    res.status(200).json(updatedFile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Supprimer un PatientFile
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const deletedFile = await PatientFile.findByIdAndDelete(id);

    if (!deletedFile) {
      return res.status(404).json({ message: "Fichier patient non trouvé" });
    }

    res.status(200).json({ message: "Fichier patient supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router;