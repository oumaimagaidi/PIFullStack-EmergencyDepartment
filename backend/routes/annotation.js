import express from "express"
import { authenticateToken } from "../middleware/authMiddleware.js"
import Annotation from "../models/Annotation.js"
import PatientFile from "../models/PatientFile.js"
import AuditLog from "../models/AuditLog.js"
import mongoose from "mongoose"
import MedicalRecord from "../models/MedicalRecord.js";
const router = express.Router()

// Create a new annotation
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès réservé aux professionnels de santé" })
    }

    const { patientFileId, text, position, type, color } = req.body

    // Validate patient file exists
    const patientFile = await PatientFile.findById(patientFileId)
    if (!patientFile) {
      return res.status(404).json({ message: "Document médical introuvable" })
    }

    const newAnnotation = new Annotation({
      patientFileId,
      authorId: req.user.id,
      text,
      position,
      type: type || "comment",
      color: color || "#FFD700",
    })

    await newAnnotation.save()

    // Log the action
    await AuditLog.create({
      action: "CREATE_ANNOTATION",
      userId: req.user.id,
      details: `Annotation créée pour le document ${patientFileId}`,
    })

    // Populate author information
    const populatedAnnotation = await Annotation.findById(newAnnotation._id).populate("authorId", "username role")

    res.status(201).json(populatedAnnotation)
  } catch (error) {
    console.error("Erreur lors de la création de l'annotation:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

// Get all annotations for a specific patient file
router.get("/file/:patientFileId", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Nurse", "Administrator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" })
    }

    const { patientFileId } = req.params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientFileId)) {
      return res.status(400).json({ message: "Select file patient" })
    }

    const annotations = await Annotation.find({ patientFileId })
      .populate("authorId", "username role")
      .sort({ createdAt: -1 })

    res.status(200).json(annotations)
  } catch (error) {
    console.error("Erreur lors de la récupération des annotations:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

// Update an annotation
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { text, isResolved, color, type } = req.body

    // Find the annotation
    const annotation = await Annotation.findById(id)
    if (!annotation) {
      return res.status(404).json({ message: "Annotation introuvable" })
    }

    // Check if user is the author or an administrator
    if (annotation.authorId.toString() !== req.user.id && req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette annotation" })
    }

    // Update fields
    if (text) annotation.text = text
    if (isResolved !== undefined) annotation.isResolved = isResolved
    if (color) annotation.color = color
    if (type) annotation.type = type

    await annotation.save()

    // Log the action
    await AuditLog.create({
      action: "UPDATE_ANNOTATION",
      userId: req.user.id,
      details: `Annotation ${id} mise à jour`,
    })

    // Return updated annotation with author info
    const updatedAnnotation = await Annotation.findById(id).populate("authorId", "username role")

    res.status(200).json(updatedAnnotation)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annotation:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})
// Nouvelle route pour récupérer les annotations par dossier médical
router.get("/medical-record/:medicalRecordId", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Nurse", "Administrator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { medicalRecordId } = req.params;

    // Validation de l'ID du dossier médical
    if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
      return res.status(400).json({ message: "ID de dossier médical invalide" });
    }

    // Vérification de l'existence du dossier médical
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical introuvable" });
    }

    // Récupération de tous les fichiers patients associés
    const patientFiles = await PatientFile.find({ medicalRecord: medicalRecordId });
    const patientFileIds = patientFiles.map(file => file._id);

    // Récupération de toutes les annotations pour ces fichiers
    const annotations = await Annotation.find({ patientFileId: { $in: patientFileIds } })
      .populate("authorId", "username role")
      .sort({ createdAt: -1 });

    res.status(200).json(annotations);
  } catch (error) {
    console.error("Erreur lors de la récupération des annotations par dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// Delete an annotation
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Find the annotation
    const annotation = await Annotation.findById(id)
    if (!annotation) {
      return res.status(404).json({ message: "Annotation introuvable" })
    }

    // Check if user is the author or an administrator
    if (annotation.authorId.toString() !== req.user.id && req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette annotation" })
    }

    await Annotation.findByIdAndDelete(id)

    // Log the action
    await AuditLog.create({
      action: "DELETE_ANNOTATION",
      userId: req.user.id,
      details: `Annotation ${id} supprimée`,
    })

    res.status(200).json({ message: "Annotation supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annotation:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

export default router
