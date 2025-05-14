import { zeroShot } from './hfZeroShot.js';
import featureConfig from '../config/featureConfig.json' assert { type: 'json' };
import EmergencyPatient from '../models/EmergencyPatient.js';

const CC_LABELS = featureConfig.cc_labels;
const MEDS_LABELS = featureConfig.meds_labels;
const VITAL_KEYS  = featureConfig.numeric_vitals;

export async function buildModelData(patientId) {
  const patient = await EmergencyPatient.findById(patientId).lean();
  if (!patient) throw new Error('Patient not found');

  const ccScores   = await zeroShot(patient.currentSymptoms,    CC_LABELS);
  const histScores = await zeroShot(patient.medicalHistory || '', MEDS_LABELS);
  const modelData  = {};

  CC_LABELS.forEach((label, idx) => {
    const key = `cc_${label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    modelData[key] = ccScores[idx];
  });
  MEDS_LABELS.forEach((label, idx) => {
    const key = `meds_${label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    modelData[key] = histScores[idx];
  });

  VITAL_KEYS.forEach(f => {
    if (patient[f] != null) modelData[f] = patient[f];
  });

  modelData.age               = patient.age || null;
  modelData.gender            = patient.gender;
  modelData.insurance_status  = patient.insuranceInfo || 'Unknown';
  modelData.emergency_level   = patient.emergencyLevel;
  modelData.pain_level        = parseInt(patient.painLevel, 10);

  return modelData;
}