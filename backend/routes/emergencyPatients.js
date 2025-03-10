// backend/routes/emergencyPatients.js
import express from 'express'; // Use import
import EmergencyPatient from '../models/EmergencyPatient.js'; // Use import and .js extension

const router = express.Router();

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

export default router; // Use export default