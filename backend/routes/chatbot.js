// backend/routes/chatbot.js (ou un nouveau fichier staffChatbotRoutes.js)
import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js';
import { getAnswerFromContext } from '../services/huggingFaceQAService.js'; // Adapter le chemin

// Importer vos modèles Mongoose
import EmergencyPatient from '../models/EmergencyPatient.js';
import MedicalRecord from '../models/MedicalRecord.js';
import PatientFile from '../models/PatientFile.js';
import Resource from '../models/Resource.js';
import Ambulance from '../models/Ambulance.js';
import { User } from '../models/User.js';

const router = express.Router();

const buildPatientContext = async (patientId, userQuery) => {
    let context = "";
    const patient = await EmergencyPatient.findById(patientId).populate('assignedDoctor', 'username specialization');
    if (!patient) return "Patient non trouvé.";

    context += `Patient: ${patient.firstName} ${patient.lastName}. Statut actuel: ${patient.status}. Niveau d'urgence: ${patient.emergencyLevel}. Symptômes principaux: ${patient.currentSymptoms}.\n`;
    if (patient.assignedDoctor) {
        context += `Médecin assigné: Dr. ${patient.assignedDoctor.username}, Spécialité: ${patient.assignedDoctor.specialization}.\n`;
    }

    const medicalRecord = await MedicalRecord.findOne({ patientId: patient._id });
    if (medicalRecord) {
        context += `Groupe sanguin: ${medicalRecord.bloodType || 'N/A'}. Allergies connues: ${medicalRecord.knownAllergies?.join(', ') || 'Aucune'}.\n`;
        
        // Pour des questions spécifiques, on peut charger plus de détails
        // Ceci est une logique simplifiée, il faudrait l'affiner
        if (userQuery.toLowerCase().includes("signes vitaux") || userQuery.toLowerCase().includes("vitals")) {
            const vitalSignsFile = await PatientFile.findOne({ medicalRecord: medicalRecord._id, type: "VitalSigns" }).sort({ dateRecorded: -1 });
            if (vitalSignsFile && vitalSignsFile.details.vitalSigns) {
                context += `Derniers signes vitaux (${new Date(vitalSignsFile.dateRecorded).toLocaleTimeString()}): Température ${vitalSignsFile.details.vitalSigns.temperature}°C, Pouls ${vitalSignsFile.details.vitalSigns.heartRate}bpm, Tension ${vitalSignsFile.details.vitalSigns.bloodPressure?.systolic}/${vitalSignsFile.details.vitalSigns.bloodPressure?.diastolic}mmHg, Saturation O2 ${vitalSignsFile.details.vitalSigns.oxygenSaturation}%.\n`;
            }
        }
        if (userQuery.toLowerCase().includes("diagnostic")) {
             const diagnosticFile = await PatientFile.findOne({ medicalRecord: medicalRecord._id, type: "Diagnostic" }).sort({ dateRecorded: -1 });
             if (diagnosticFile && diagnosticFile.details.diagnosis) {
                context += `Diagnostic principal: ${diagnosticFile.details.diagnosis}.\n`;
             }
        }
        // Ajouter plus de logique pour récupérer des infos de PatientFile si la question est spécifique
        // (ex: "derniers traitements", "résultats labo X")
    }
    return context;
};

const buildResourceContext = async (resourceId) => {
    const resource = await Resource.findById(resourceId);
    if (!resource) return "Ressource non trouvée.";
    return `Ressource: ${resource.name} (Type: ${resource.type}). Statut: ${resource.status}. Quantité: ${resource.quantity}. Localisation: ${resource.location}.\n`;
};

const buildAmbulanceContext = async (ambulanceId) => {
    const ambulance = await Ambulance.findById(ambulanceId).populate('team', 'username');
    if (!ambulance) return "Ambulance non trouvée.";
     let teamInfo = ambulance.team.length > 0 ? ambulance.team.map(member => member.username).join(', ') : 'Aucune';
    return `Ambulance: ${ambulance.name}. Statut: ${ambulance.status}. Localisation: Lat ${ambulance.latitude}, Lng ${ambulance.longitude}. Destination: ${ambulance.destination || 'Aucune'}. Équipe: ${teamInfo}.\n`;
};


router.post('/staff-query', authenticateToken, authorize(['Doctor', 'Nurse', 'Administrator']), async (req, res) => {
    const { targetType, targetId, userQuery } = req.body;
    
    if (!targetType || !targetId || !userQuery) {
        return res.status(400).json({ message: "targetType, targetId, et userQuery sont requis." });
    }
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: "targetId invalide." });
    }

    let context = "";
    try {
        switch (targetType) {
            case 'patient':
                context = await buildPatientContext(targetId, userQuery);
                break;
            case 'resource':
                context = await buildResourceContext(targetId);
                break;
            case 'ambulance':
                context = await buildAmbulanceContext(targetId);
                break;
            default:
                return res.status(400).json({ message: "targetType non supporté." });
        }

        if (context.includes("non trouvé") || context.includes("non trouvée")) { // Gestion si l'ID n'est pas bon
             return res.status(404).json({ answer: context, score: 0 });
        }

        const qaResult = await getAnswerFromContext(context, userQuery);
        res.json(qaResult); // Envoie { answer: "...", score: ... }

    } catch (error) {
        console.error("[Staff Query Route] Erreur:", error);
        res.status(500).json({ message: "Erreur du serveur lors du traitement de la requête chatbot.", details: error.message });
    }
});

export default router;