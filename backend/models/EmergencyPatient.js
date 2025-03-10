// backend/models/EmergencyPatient.js
import mongoose from 'mongoose'; // Use import

const emergencyPatientSchema = new mongoose.Schema({
// ... (your schema definition) ...
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true }, // Consider using Date type
    gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
    phoneNumber: { type: String, required: true },
    email: { type: String, validate: {
            validator: function(v) {
                // Basic email validation (you might want a more robust library)
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    address: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    insuranceInfo: { type: String },
    allergies: { type: String },
    currentMedications: { type: String },
    medicalHistory: { type: String },
    currentSymptoms: { type: String, required: true },
    painLevel: { type: String, required: true, enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
    emergencyLevel: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
    createdAt: { type: Date, default: Date.now } // Keep this for consistency
}, { timestamps: true }); // Keep timestamps!

const EmergencyPatient = mongoose.model('EmergencyPatient', emergencyPatientSchema);

export default EmergencyPatient; // Use export default