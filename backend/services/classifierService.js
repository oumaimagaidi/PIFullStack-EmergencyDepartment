import dotenv from 'dotenv';
dotenv.config();

import { pipeline } from '@xenova/transformers';

let classifierPromise = null;

async function getClassifier() {
  if (!classifierPromise) {
    const options = {};
    if (process.env.HF_HUB_TOKEN) {
      options.auth_token = process.env.HF_HUB_TOKEN;
    }

    classifierPromise = pipeline(
      'zero-shot-classification',
      'Xenova/nli-deberta-v3-xsmall',
      options
    );
  }
  return classifierPromise;
}

export async function classifyPatientNeeds(prompt) {
  const candidateLabels = ['bed', 'icu', 'ct-scan', 'xray', 'ventilator'];
  const classifier = await getClassifier();
  
  // Call the classifier with all candidate labels
  const result = await classifier(prompt, candidateLabels);
  
  console.log('Raw classifier result:', JSON.stringify(result, null, 2));

  // Check if the result has both labels and scores arrays
  if (!result.labels || !result.scores) {
    console.error("Error: Expected structure not found in classifier result");
    return null;
  }

  // Find the index of the highest score
  let maxScoreIndex = 0;
  for (let i = 1; i < result.scores.length; i++) {
    if (result.scores[i] > result.scores[maxScoreIndex]) {
      maxScoreIndex = i;
    }
  }
  
  // Return only the top label
  return result.labels[maxScoreIndex];
}

// Example usage
async function test() {
  const prompt = "Chief complaint: Headache and fever. Vitals: {\"bloodPressure\":{\"systolic\":118,\"diastolic\":76},\"temperature\":38.2,\"heartRate\":92,\"respiratoryRate\":20,\"oxygenSaturation\":97}. Notes: Initial diagnostic notes..";
  const topRecommendation = await classifyPatientNeeds(prompt);
  console.log("Top recommendation:", topRecommendation);
}

// Uncomment to run test
// test().catch(console.error);