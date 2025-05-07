import express from 'express';
import PatientFile from '../models/PatientFile.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { classifyPatientNeeds } from '../services/classifierService.js'; // still using this name

const router = express.Router();

// POST /api/patients/:patientId/recommend
router.post('/:patientId/recommend', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { noteOverride } = req.body;

    // 1. Find the MedicalRecord
    const medRecord = await MedicalRecord.findOne({ patientId });
    if (!medRecord) {
      return res.status(404).send({ error: 'Medical record not found for this patient' });
    }

    // 2. Fetch latest unarchived PatientFile
    const patientFile = await PatientFile.findOne({
      medicalRecord: medRecord._id,
      isArchived: false,
    }).sort({ dateRecorded: -1 });

    if (!patientFile) {
      return res.status(404).send({ error: 'Patient file not found for this record' });
    }

    // 3. Build prompt
    const prompt = noteOverride || 
      `Chief complaint: ${patientFile.details?.chiefComplaint || 'N/A'}. ` +
      `Vitals: ${JSON.stringify(patientFile.details?.vitalSigns || {})}. ` +
      `Notes: ${patientFile.notes || 'None'}.`;

    // 4. Generate recommendations
    const recommendations = await classifyPatientNeeds(prompt); // returns top 3 suggestions
    console.log('Recommendations:', recommendations);
    return res.send({ recommendations });

  } catch (err) {
    console.error('Error in recommend route:', err);
    return res.status(500).send({ error: 'Server error' });
  }
});

export default router;
