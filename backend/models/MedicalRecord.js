// backend/models/MedicalRecord.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const medicalRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyPatient',
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    accessCode: {
        type: String,
        unique: true,
        default: () => `MR-${uuidv4().substr(0, 8).toUpperCase()}`
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
    },
    bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    knownAllergies: [String],
    chronicConditions: [String],
    currentMedications: [
        {
            name: String,
            dosage: String,
            frequency: String,
        },
    ],
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ... autres méthodes et virtuals ...
medicalRecordSchema.virtual('patientFiles', {
    ref: 'PatientFile',
    localField: '_id',
    foreignField: 'medicalRecord'
  });
const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;