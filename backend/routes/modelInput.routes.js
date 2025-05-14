import express from 'express';
import { createModelInput } from '../services/modelInputService.js';

const router = express.Router();

router.post('/generate/:patientId', async (req, res) => {
  try {
    const modelInput = await createModelInput(req.params.patientId);
    res.status(201).json({ message: 'ModelInput created', data: modelInput });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
