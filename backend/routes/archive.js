import express from "express"
import { authenticateToken } from "../middleware/authMiddleware.js"
import PatientFile from "../models/PatientFile.js"
import MedicalRecord from "../models/MedicalRecord.js"
import AuditLog from "../models/AuditLog.js"
import mongoose from "mongoose"

const router = express.Router()

// Archive a patient file
router.put("/patient-files/:id/archive", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Administrator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès réservé aux médecins et administrateurs" })
    }

    const { id } = req.params
    const { reason } = req.body

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de document invalide" })
    }

    // Find the patient file
    const patientFile = await PatientFile.findById(id)
    if (!patientFile) {
      return res.status(404).json({ message: "Document médical introuvable" })
    }

    // Update the file status to archived
    patientFile.isArchived = true
    patientFile.archivedAt = new Date()
    patientFile.archiveReason = reason || "Document archivé par un professionnel de santé"
    patientFile.archivedBy = req.user.id

    await patientFile.save()

    // Log the action
    await AuditLog.create({
      action: "ARCHIVE_PATIENT_FILE",
      userId: req.user.id,
      details: `Document médical ${id} archivé: ${reason || "Aucune raison spécifiée"}`,
    })

    res.status(200).json({
      message: "Document archivé avec succès",
      patientFile,
    })
  } catch (error) {
    console.error("Erreur lors de l'archivage du document:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

// Restore an archived patient file
router.put("/patient-files/:id/restore", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Administrator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès réservé aux médecins et administrateurs" })
    }

    const { id } = req.params
    const { reason } = req.body

    // Find the patient file
    const patientFile = await PatientFile.findById(id)
    if (!patientFile) {
      return res.status(404).json({ message: "Document médical introuvable" })
    }

    if (!patientFile.isArchived) {
      return res.status(400).json({ message: "Ce document n'est pas archivé" })
    }

    // Restore the file
    patientFile.isArchived = false
    patientFile.archivedAt = null
    patientFile.archiveReason = null
    patientFile.archivedBy = null
    patientFile.restoredAt = new Date()
    patientFile.restoredBy = req.user.id
    patientFile.restoreReason = reason || "Document restauré par un professionnel de santé"

    await patientFile.save()

    // Log the action
    await AuditLog.create({
      action: "RESTORE_PATIENT_FILE",
      userId: req.user.id,
      details: `Document médical ${id} restauré: ${reason || "Aucune raison spécifiée"}`,
    })

    res.status(200).json({
      message: "Document restauré avec succès",
      patientFile,
    })
  } catch (error) {
    console.error("Erreur lors de la restauration du document:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

// Get all archived patient files for a medical record
router.get("/medical-records/:recordId/archived", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Administrator", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" })
    }

    const { recordId } = req.params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ message: "ID de dossier médical invalide" })
    }

    // Check if medical record exists
    const medicalRecord = await MedicalRecord.findById(recordId)
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical introuvable" })
    }

    // Get all archived files for this medical record
    const archivedFiles = await PatientFile.find({
      medicalRecord: recordId,
      isArchived: true,
    }).populate("archivedBy", "username role")

    res.status(200).json(archivedFiles)
  } catch (error) {
    console.error("Erreur lors de la récupération des documents archivés:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

// Get all archived patient files (admin only)
router.get("/archived", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès réservé aux administrateurs" })
    }

    // Optional query parameters for filtering
    const { before, after, medicalRecordId } = req.query

    const query = { isArchived: true }

    if (before) {
      query.archivedAt = { ...query.archivedAt, $lt: new Date(before) }
    }

    if (after) {
      query.archivedAt = { ...query.archivedAt, $gt: new Date(after) }
    }

    if (medicalRecordId && mongoose.Types.ObjectId.isValid(medicalRecordId)) {
      query.medicalRecord = medicalRecordId
    }

    const archivedFiles = await PatientFile.find(query)
      .populate("archivedBy", "username role")
      .populate("medicalRecord", "accessCode")
      .sort({ archivedAt: -1 })

    res.status(200).json(archivedFiles)
  } catch (error) {
    console.error("Erreur lors de la récupération des documents archivés:", error)
    res.status(500).json({ message: "Erreur serveur", error: error.message })
  }
})

export default router
