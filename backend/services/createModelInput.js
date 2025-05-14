import axios from 'axios';
import ModelInput from '../models/ModelInput.js';

/**
 * Sends features from a ModelInput document to the XGBoost model and updates the document with the prediction.
 * @param {string} modelInputId - The ID of the ModelInput document.
 * @returns {Promise<{ prediction: string, probability: number }>} - The prediction and probability.
 */
export async function getPrediction(modelInputId) {
  // Retrieve the ModelInput document
  const modelInput = await ModelInput.findById(modelInputId);
  if (!modelInput) {
    throw new Error('ModelInput not found');
  }

  // Ensure the Flask app is running at this endpoint
  const PREDICT_URL = 'http://127.0.0.1:5000/predict';

  try {
    // Send the features to the Flask app
    const response = await axios.post(PREDICT_URL, modelInput.features, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Extract prediction and probability from the response
    const { prediction: numericPrediction, probability } = response.data;

    // Map numeric prediction (0 or 1) to 'Discharge' or 'Admit'
    const prediction = numericPrediction === 1 ? 'Admit' : 'Discharge';

    // Update the ModelInput document
    modelInput.prediction = prediction;
    modelInput.probability = probability;
    await modelInput.save();

    return { prediction, probability };
  } catch (error) {
    console.error('Error getting prediction:', error.message);
    throw new Error('Failed to get prediction from the XGBoost model');
  }
}