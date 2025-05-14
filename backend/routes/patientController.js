// backend/controllers/patientController.js
import EmergencyPatient from '../models/EmergencyPatient.js';
import { getPredictionForPatient } from '../services/predictionService.js';

export const createPatient = async (req, res) => {
  const patient = await EmergencyPatient.create(req.body);

  const { prediction, probability } = await getPredictionForPatient(patient._id);
  res.status(201).json({ patient, prediction, probability });
};
