import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
const HF_API_TOKEN = process.env.HF_ACCESS_TOKEN;

if (!HF_API_TOKEN) {
  throw new Error('HF_API_TOKEN not found in environment variables');
}

/**
 * Performs zero-shot classification using Hugging Face Inference API.
 *
 * @param {string} inputText - Input text to classify.
 * @param {string[]} labels - Array of candidate labels.
 * @returns {Promise<number[]>} Array of confidence scores for each label.
 */
export async function zeroShot(inputText, labels) {
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: inputText,
        parameters: { candidate_labels: labels },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
        },
      }
    );

    if (!response.data || !Array.isArray(response.data.scores)) {
      throw new Error('Unexpected response format from Hugging Face API');
    }

    return response.data.scores;
  } catch (error) {
    console.error('Error in zeroShot:', error.response?.data || error.message);
    throw new Error('Zero-shot classification failed');
  }
}
