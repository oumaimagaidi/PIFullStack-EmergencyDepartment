import express from 'express';
import EmergencyPatient from '../models/EmergencyPatient.js';
import mongoose from 'mongoose';

const router = express.Router();

// Route POST pour enregistrer une nouvelle demande d'urgence
router.post('/', async (req, res) => {
  try {
    const patient = new EmergencyPatient(req.body);
    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: messages });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Route GET pour récupérer toutes les demandes d'urgence
router.get('/', async (req, res) => {
  try {
    const emergencyPatients = await EmergencyPatient.find();
    res.status(200).json(emergencyPatients);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'urgence:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes d'urgence" });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Patient ID is required" });
  }

  try {
    const deletedPatient = await EmergencyPatient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Demande d'urgence non trouvée" });
    }

    res.status(200).json({ message: "Demande d'urgence supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande d'urgence:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
});

export default router;
