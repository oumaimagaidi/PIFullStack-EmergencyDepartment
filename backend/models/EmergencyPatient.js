// backend/models/EmergencyPatient.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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
    prediction: { type: String, enum: ['Admit', 'Discharge'], default: null },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    medicalRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        default: null,
    },
    patientCode: { 
        type: String, 
        unique: true,
        default: () => `EMP-${uuidv4().substr(0, 8).toUpperCase()}`
    },
    isNewPatient: { type: Boolean, default: true },
    previousVisits: [{
        visitDate: { type: Date, default: Date.now },
        symptoms: String,
        treatment: String,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    createdAt: { type: Date, default: Date.now },
    arrivalTime: { type: Date, default: Date.now }
}, { timestamps: true });

// Méthode pour trouver un patient existant
emergencyPatientSchema.statics.findExistingPatient = async function(firstName, lastName, email) {
    return this.findOne({ 
        firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
        lastName: { $regex: new RegExp(`^${lastName}$`, 'i') },
        email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).populate('medicalRecord');
};
// Nouvelle méthode pour les statistiques par niveau d'urgence
emergencyPatientSchema.statics.getEmergencyLevelStats = async function() {
    return this.aggregate([
        {
            $group: {
                _id: "$emergencyLevel",
                count: { $sum: 1 },
                // Vous pouvez ajouter d'autres statistiques ici si nécessaire
                averagePainLevel: { $avg: { $toDouble: "$painLevel" } }
            }
        },
        {
            $project: {
                emergencyLevel: "$_id",
                count: 1,
                averagePainLevel: 1,
                _id: 0
            }
        },
        {
            $sort: { 
                emergencyLevel: 1 
            }
        }
    ]);
};

// Méthode pour les statistiques temporelles (optionnelle)
emergencyPatientSchema.statics.getEmergencyTrends = async function(timePeriod = 'day') {
    let groupFormat;
    
    switch (timePeriod) {
        case 'hour':
            groupFormat = { hour: { $hour: "$createdAt" } };
            break;
        case 'day':
            groupFormat = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
            break;
        case 'month':
            groupFormat = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
            break;
        default:
            groupFormat = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
    }

    return this.aggregate([
        {
            $group: {
                _id: groupFormat,
                total: { $sum: 1 },
                levels: {
                    $push: {
                        level: "$emergencyLevel",
                        pain: "$painLevel"
                    }
                }
            }
        },
        { $sort: { "_id": 1 } }
    ]);
};
const EmergencyPatient = mongoose.model('EmergencyPatient', emergencyPatientSchema);

export default EmergencyPatient;