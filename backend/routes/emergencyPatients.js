// backend/routes/emergency-patients.js
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

router.get('/:patientId/status', async (req, res) => { // Route with patientId as URL param
  try {
      const patientId = req.params.patientId; // **Correctly extract patientId from req.params**

      // Check if patientId is a valid ObjectId (important for Mongoose)
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
          return res.status(400).json({ message: 'Invalid patient ID format' }); // Return error if ID is invalid
      }

      const emergencyPatient = await EmergencyPatient.findById(patientId); // **Use the extracted patientId in findById**

      if (!emergencyPatient) {
          return res.status(404).json({ message: 'Emergency patient not found' });
      }

      res.status(200).json({ status: emergencyPatient.status }); // Send back the status
  } catch (error) {
      console.error("Error fetching emergency patient status:", error);
      res.status(500).json({ message: 'Server error', error: error });
  }
});
export default router;