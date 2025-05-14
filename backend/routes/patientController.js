// backend/controllers/patientController.js
// backend/controllers/patientController.js
import EmergencyPatient from '../models/EmergencyPatient.js';
import { getPredictionForPatient } from '../services/predictionService.js';

export const createPatient = async (req, res) => {
  // 1) Create patient
  let patient = await EmergencyPatient.create(req.body);

  // 2) Get prediction and probability
  const { prediction, probability } = await getPredictionForPatient(patient._id);
console.log("hey")
  // 3) Attach to patient document and save
  patient.prediction  = prediction;
  await patient.save();

  // 4) Respond with enriched patient
  res.status(201).json({ patient });
};
