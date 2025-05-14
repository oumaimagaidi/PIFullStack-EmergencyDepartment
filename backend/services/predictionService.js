// services/predictionService.js
import axios from 'axios';
import ModelInput from '../models/ModelInput.js';
import { buildModelData } from '../utils/buildModelData.js';

const PREDICT_URL = 'http://127.0.0.1:5000/predict';

export async function getPredictionForPatient(patientId) {
  // 1) Build the feature map from the patient record
  const features = await buildModelData(patientId);

  // 2) Find or create the ModelInput doc
  let inputDoc = await ModelInput.findOne({ patientId });
  if (!inputDoc) {
    inputDoc = await ModelInput.create({ patientId, features });
  } else {
    inputDoc.features = features;
    await inputDoc.save();
  }

  // 3) Send features to your ML service
  let response;
  try {
    response = await axios.post(
      PREDICT_URL,
      features,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30_000,
      }
    );
  } catch (err) {
    console.error('Error calling prediction endpoint:', err.message);
    throw new Error('Prediction service error');
  }

  // 4) Parse and save back the prediction
  const { prediction: numericPred, probability } = response.data;
  const label = numericPred === 1 ? 'Admit' : 'Discharge';

  inputDoc.prediction  = label;
  inputDoc.probability = probability;
  await inputDoc.save();

  return { prediction: label, probability };
}
