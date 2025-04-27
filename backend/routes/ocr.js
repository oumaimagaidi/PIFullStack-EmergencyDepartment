import express from "express";
import { uploadImage } from "../middleware/fileUpload.js";
import { processImage } from "../services/ocrService.js";
import OcrResult from "../models/OcrResult.js";
import PatientFile from "../models/PatientFile.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

router.post(
  "/process-image",
  authenticateToken,
  uploadImage.single("medicalImage"),
  async (req, res) => {
    try {
      const { medicalRecordId } = req.body;

      // Validation
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "Aucune image téléchargée" 
        });
      }

      if (!medicalRecordId) {
        return res.status(400).json({ 
          success: false, 
          error: "ID de dossier médical requis" 
        });
      }

      if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
        return res.status(400).json({ 
          success: false, 
          error: "ID de dossier médical invalide" 
        });
      }

      // Traitement OCR
      const result = await processImage(req.file.path, medicalRecordId);

      // Transaction MongoDB
      const session = await mongoose.startSession();
      let savedOcr, savedFile;

      try {
        await session.withTransaction(async () => {
          // Sauvegarde résultat OCR
          const ocrRecord = new OcrResult({
            medicalRecord: medicalRecordId,
            originalFilename: req.file.originalname,
            textResult: result.data.text,
            extractedData: result.data.extractedData
          });

          savedOcr = await ocrRecord.save({ session });

          // Sauvegarde fichier patient
          const patientFile = new PatientFile({
            medicalRecord: medicalRecordId,
            type: "Diagnostic",
            isOCRProcessed: true,
            ocrResults: savedOcr._id,
            details: {
              diagnosis: result.data.extractedData.diagnosis,
              diagnosticTests: result.data.extractedData.tests,
              patientInfo: {
                firstName: result.data.extractedData.patientName?.split(' ')[0] || 'Inconnu',
                lastName: result.data.extractedData.patientName?.split(' ').slice(1).join(' ') || 'Inconnu'
              }
            }
          });

          savedFile = await patientFile.save({ session });
        });
      } finally {
        await session.endSession();
      }

      // Réponse réussie
      res.json({
        success: true,
        data: {
          text: result.data.text,
          extractedData: result.data.extractedData,
          databaseIds: {
            ocrId: savedOcr._id,
            fileId: savedFile._id
          }
        }
      });

    } catch (error) {
      console.error("Erreur OCR:", error);
      const errorMessage = error.message.includes("ENOENT") 
        ? "Fichier introuvable" 
        : error.message;
      
      res.status(500).json({
        success: false,
        error: `Échec du traitement OCR: ${errorMessage}`
      });
    }
  }
);

export default router;