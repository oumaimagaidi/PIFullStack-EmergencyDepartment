import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateToken } from "../middleware/authMiddleware.js";
import  Ambulance  from "../models/Ambulance.js";

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();

// Create a new ambulance (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }
    console.log("📩 Requête reçue :", req.body);
    const newAmbulance = new Ambulance(req.body);
    const savedAmbulance = await newAmbulance.save();
    res.status(201).json(savedAmbulance);
  } catch (error) {
    console.error("Erreur lors de la création de l'ambulance:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Get all ambulances
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Allow access to Administrator, Doctor, or Nurse roles
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    
    const ambulances = await Ambulance.find().populate("team", "username email role");
    res.status(200).json(ambulances);
  } catch (error) {
    console.error("Erreur lors de la récupération des ambulances:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// Get the ambulance assigned to the current nurse
router.get("/assigned", authenticateToken, async (req, res) => {
    try {
      // Only nurses are allowed to access this endpoint
      if (req.user.role !== "Nurse") {
        return res.status(403).json({ message: "Accès refusé" });
      }
  
      // Find an ambulance where the team includes the current nurse's id
      const ambulance = await Ambulance.findOne({ team: req.user.id }).populate("team", "username email role");
      if (!ambulance) {
        return res.status(404).json({ message: "Aucune ambulance assignée" });
      }
  
      res.status(200).json(ambulance);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ambulance assignée:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  });
  
// Get ambulance by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const ambulance = await Ambulance.findById(req.params.id).populate("team", "username email role");
    
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    res.status(200).json(ambulance);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ambulance:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Update ambulance by ID
router.put("/:id", authenticateToken, async (req, res) => {
    console.log("📩 Requête reçue :", req.user.role);

  try {
    if (!["Administrator", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const updatedAmbulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedAmbulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    res.status(200).json(updatedAmbulance);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ambulance:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Delete ambulance by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const deletedAmbulance = await Ambulance.findByIdAndDelete(req.params.id);
    
    if (!deletedAmbulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    res.status(200).json({ message: "Ambulance supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'ambulance:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Update ambulance status
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const { status } = req.body;
    
    if (!status || !['IN_TRANSIT', 'AVAILABLE', 'ON_MISSION', 'MAINTENANCE'].includes(status)) {
      return res.status(400).json({ message: "Statut d'ambulance invalide" });
    }

    const ambulance = await Ambulance.findById(req.params.id);
    
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    ambulance.status = status;
    ambulance.lastUpdated = Date.now();
    await ambulance.save();
    
    res.status(200).json({
      message: `Statut de l'ambulance mis à jour à ${status}`,
      ambulance: ambulance
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'ambulance:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Update ambulance location
router.put("/:id/location", authenticateToken, async (req, res) => {
  try {
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const { latitude, longitude } = req.body;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: "Coordonnées de localisation invalides" });
    }

    const ambulance = await Ambulance.findById(req.params.id);
    
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    ambulance.latitude = latitude;
    ambulance.longitude = longitude;
    ambulance.lastUpdated = Date.now();
    await ambulance.save();
    
    res.status(200).json({
      message: "Localisation de l'ambulance mise à jour",
      ambulance: ambulance
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la localisation de l'ambulance:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Add team member to ambulance
router.post("/:id/team", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const { userId } = req.body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const ambulance = await Ambulance.findById(req.params.id);
    
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    // Prevent duplicate team members
    if (ambulance.team.includes(userId)) {
      return res.status(400).json({ message: "Cet utilisateur fait déjà partie de l'équipe" });
    }
    
    ambulance.team.push(userId);
    ambulance.lastUpdated = Date.now();
    await ambulance.save();
    
    const updatedAmbulance = await Ambulance.findById(req.params.id).populate("team", "username email role");
    
    res.status(200).json({
      message: "Membre ajouté à l'équipe",
      ambulance: updatedAmbulance
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un membre à l'équipe:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Remove team member from ambulance
router.delete("/:id/team/:userId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const ambulance = await Ambulance.findById(req.params.id);
    
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    // Check if user is in the team
    if (!ambulance.team.includes(req.params.userId)) {
      return res.status(400).json({ message: "Cet utilisateur ne fait pas partie de l'équipe" });
    }
    
    ambulance.team = ambulance.team.filter(id => id.toString() !== req.params.userId);
    ambulance.lastUpdated = Date.now();
    await ambulance.save();
    
    const updatedAmbulance = await Ambulance.findById(req.params.id).populate("team", "username email role");
    
    res.status(200).json({
      message: "Membre retiré de l'équipe",
      ambulance: updatedAmbulance
    });
  } catch (error) {
    console.error("Erreur lors du retrait d'un membre de l'équipe:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Get available ambulances
router.get("/status/available", authenticateToken, async (req, res) => {
  try {
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    
    const availableAmbulances = await Ambulance.find({ status: "AVAILABLE" }).populate("team", "username email role");
    res.status(200).json(availableAmbulances);
  } catch (error) {
    console.error("Erreur lors de la récupération des ambulances disponibles:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Update estimated arrival time
router.put("/:id/eta", authenticateToken, async (req, res) => {
  try {
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID d'ambulance invalide" });
    }

    const { estimatedArrival } = req.body;
    
    if (!estimatedArrival) {
      return res.status(400).json({ message: "Heure d'arrivée estimée requise" });
    }

    const ambulance = await Ambulance.findById(req.params.id);
    
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance non trouvée" });
    }
    
    ambulance.estimatedArrival = new Date(estimatedArrival);
    ambulance.lastUpdated = Date.now();
    await ambulance.save();
    
    res.status(200).json({
      message: "Heure d'arrivée estimée mise à jour",
      ambulance: ambulance
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'heure d'arrivée estimée:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


export default router;