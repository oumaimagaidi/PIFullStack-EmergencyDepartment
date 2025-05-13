// models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipientId: { // L'ID de l'utilisateur qui doit recevoir la notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Important pour les requêtes
    },
    message: {
        type: String,
        required: true,
    },
    type: { // Ex: 'doctor_assignment', 'patient_status_update', 'new_emergency_case'
        type: String,
        enum: ['doctor_assignment', 'patient_status_update', 'new_emergency_case', 'ambulance_alert', 'generic'], // Ajoutez d'autres types si besoin
        default: 'generic',
    },
    relatedEntityId: { // ID du patient, de l'urgence, etc. lié à la notification
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    relatedEntityType: { // 'EmergencyPatient', 'Ambulance', etc.
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Optionnel: les notifications expirent après 30 jours
    },
});

export default mongoose.model('Notification', NotificationSchema);