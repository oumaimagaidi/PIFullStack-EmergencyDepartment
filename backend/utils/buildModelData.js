// File: backend/utils/buildModelData.js
import dotenv from 'dotenv';
dotenv.config();

import EmergencyPatient from '../models/EmergencyPatient.js';
import featureConfig from '../config/featureConfig.json' assert { type: 'json' };
import { pipeline } from '@xenova/transformers';

let zsPipeline = null;
async function getZeroShotPipeline() {
  if (!zsPipeline) {
    const options = {};
    if (process.env.HF_HUB_TOKEN) {
      options.auth_token = process.env.HF_HUB_TOKEN;
    }
    zsPipeline = await pipeline(
      'zero-shot-classification',
      'Xenova/nli-deberta-v3-xsmall',
      options
    );
  }
  return zsPipeline;
}

async function zeroShot(text, candidateLabels) {
  const clf = await getZeroShotPipeline();
  const result = await clf(text, candidateLabels);
  if (!result.scores || result.scores.length !== candidateLabels.length) {
    throw new Error('Unexpected zero‑shot output');
  }
  return result.scores;
}

/**
 * Build the full ML input feature map for a given patient ID.
 * @param {string} patientId
 * @returns {Promise<Object>} flat feature map
 */
export async function buildModelData(patientId) {
  // 1) Load patient
  const patient = await EmergencyPatient.findById(patientId).lean();
  if (!patient) throw new Error('Patient not found');

  // 2) Zero‑shot classification
  const ccScores  = await zeroShot(patient.currentSymptoms,    featureConfig.cc_labels);
  const medsScores = await zeroShot(patient.medicalHistory || '', featureConfig.meds_labels);

  // 3) Assemble features
  const modelData = {};

  featureConfig.cc_labels.forEach((lbl, i) => {
    const key = 'cc_' + lbl.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    modelData[key] = ccScores[i];
  });

  featureConfig.meds_labels.forEach((lbl, i) => {
    const key = 'meds_' + lbl.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    modelData[key] = medsScores[i];
  });

  // 4) Numeric vitals
  featureConfig.numeric_vitals.forEach((f) => {
    if (patient[f] != null) {
      modelData[f] = patient[f];
    }
  });

  // 5) Demographics
  modelData.age              = patient.age ?? null;
  modelData.gender           = patient.gender;
  modelData.insurance_status = patient.insuranceInfo || 'Unknown';
  modelData.emergency_level  = patient.emergencyLevel;
  modelData.pain_level       = parseInt(patient.painLevel, 10);

  return modelData;
}

// Example test
// (async () => {
//   const data = await buildModelData('<somePatientId>');
//   console.log(JSON.stringify(data, null, 2));
// })().catch(console.error);
