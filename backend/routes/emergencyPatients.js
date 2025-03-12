// backend/routes/emergency-patients.js
import express from 'express';
import EmergencyPatient from '../models/EmergencyPatient.js';

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

// Route GET pour récupérer TOUTES LES demandes d'urgence
router.get('/', async (req, res) => {
  try {
    const emergencyPatients = await EmergencyPatient.find();
    res.status(200).json(emergencyPatients);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'urgence:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes d'urgence" });
  }
});

// Route PUT pour mettre à jour le statut d'une demande d'urgence par ID
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedPatient = await EmergencyPatient.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Demande d'urgence non trouvée" });
    }

    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la demande d'urgence:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du statut" });
  }
});

// Route GET pour récupérer le statut d'un patient d'urgence spécifique par ID
router.get('/:patientId/status', async (req, res) => {
  try {
    const patientId = req.params.patientId; // Récupérer patientId depuis les paramètres de l'URL
    const emergencyPatient = await EmergencyPatient.findById(patientId); // Chercher le patient par ID

    if (!emergencyPatient) {
      return res.status(404).json({ message: "Patient d'urgence non trouvé" }); // Patient non trouvé
    }

    res.status(200).json({ status: emergencyPatient.status }); // Renvoyer uniquement le statut en JSON
  } catch (error) {
    console.error("Erreur lors de la récupération du statut du patient:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du statut du patient" });
  }
});

export default router;