// backend/models/EmergencyPatient.js
import mongoose from 'mongoose';

const emergencyPatientSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
    phoneNumber: { type: String, required: true },
    email: {
        type: String,
        validate: {
            validator: function (v) {
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
    status: { type: String, default: 'Demande Enregistrée' },
    // --- NOUVEAU CHAMP ---
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence au modèle User (qui inclut les Doctors)
        default: null // Par défaut, aucun médecin assigné
    },
    medicalRecord: { // Nouvelle référence
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        default: null,
      },
    // --- FIN NOUVEAU CHAMP ---
    createdAt: { type: Date, default: Date.now },
    arrivalTime: { type: Date, default: Date.now } // Ajout pour la prédiction, gardons-le
}, { timestamps: true });

const EmergencyPatient = mongoose.model('EmergencyPatient', emergencyPatientSchema);

export default EmergencyPatient;