import Document from "../models/Document.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const uploadDocument = async (req, res) => {
  try {
    console.log("Requête reçue:", req.body, req.file); // Log pour débogage
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "Utilisateur non authentifié ou ID manquant" });
    }
    const { file } = req;
    const { patientId, type } = req.body;

    // Validation des champs
    if (!file) return res.status(400).json({ error: "Aucun fichier téléversé" });
    if (!patientId) {
      return res.status(400).json({ error: "patientId manquant dans la requête" });
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: `Format d'ID patient invalide: ${patientId}` });
    }
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: `Format d'ID utilisateur invalide: ${req.user.id}` });
    }
    if (!type || !["General", "Test Result", "Prescription", "Report"].includes(type)) {
      return res.status(400).json({ error: `Type de document invalide: ${type}` });
    }

    const fileUrl = `/uploads/${file.filename}`;
    const document = new Document({
      patientId: new mongoose.Types.ObjectId(patientId),
      fileUrl,
      type,
      uploadedBy: new mongoose.Types.ObjectId(req.user.id),
    });

    await document.save();
    console.log("Document enregistré dans MongoDB:", document._id); // Log pour débogage
    res.status(201).json({ message: "Document téléversé avec succès", fileUrl });
  } catch (error) {
    console.error("Erreur lors du téléversement:", error);
    res.status(500).json({ error: `Erreur serveur: ${error.message}` });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.id })
      .populate("patientId uploadedBy")
      .sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), "uploads", fileName);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: "Fichier non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const previewDocument = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), "uploads", fileName);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "Fichier non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { fileName } = req.params;
    const document = await Document.findOneAndDelete({
      fileUrl: `/uploads/${fileName}`,
      uploadedBy: req.user.id,
    });
    if (document) {
      fs.unlinkSync(path.join(process.cwd(), "uploads", fileName));
      res.status(200).json({ message: "Document supprimé avec succès" });
    } else {
      res.status(404).json({ error: "Document non trouvé ou non autorisé" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};