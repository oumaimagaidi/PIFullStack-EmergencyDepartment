import ModelInput from '../models/ModelInput.js';
import EmergencyPatient from '../models/EmergencyPatient.js';
import { buildModelData } from '../utils/buildModelData.js';

export async function createModelInput(patientId) {
  const patient = await EmergencyPatient.findById(patientId);
  if (!patient) throw new Error('Patient not found');

  const features = await buildModelData(patientId);

  const modelInput = new ModelInput({
    patientId,
    features,
    prediction: null,
    probability: null
  });

  await modelInput.save();
  return modelInput;
}
