import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import EmergencyPatient from '../models/EmergencyPatient.js';
import { getPredictionForPatient } from '../services/predictionService.js';

async function runTest() {
  // 1) Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emergency_db');
  console.log('🗄️  Connected to MongoDB');

  // 2) Create or find a sample patient
  const sampleData = {
    firstName: 'John', lastName: 'Doe', dateOfBirth: '1970-01-01',
    gender: 'male', phoneNumber: '555-0001', email: 'john.doe@example.com',
    address: '456 Elm St', emergencyContact: 'Jane Doe', insuranceInfo: 'Commercial',
    allergies: 'None', currentMedications: 'None', medicalHistory: 'None',
    currentSymptoms: 'Chest pain and shortness of breath', painLevel: '7', emergencyLevel: 'high'
  };
  let patient = await EmergencyPatient.create(sampleData);
  console.log('👤 Created sample patient:', patient._id);

  try {
    // 3) Invoke the prediction service
    const { prediction, probability } = await getPredictionForPatient(patient._id);
    console.log(`🤖 Prediction: ${prediction}, Probability: ${probability}`);
  } catch (err) {
    console.error('❌ Error during predictionService test:', err);
  } finally {
    // 4) Clean up
    await EmergencyPatient.deleteOne({ _id: patient._id });
    console.log('🗑️  Deleted sample patient');
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runTest().catch(err => {
  console.error('Unexpected error in test script:', err);
  process.exit(1);
});