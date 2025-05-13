// backend/routes/chatbot.js
import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js';
import { getAnswerFromContext } from '../services/huggingFaceQAService.js';

// Importer vos modèles Mongoose
import EmergencyPatient from '../models/EmergencyPatient.js';
import MedicalRecord from '../models/MedicalRecord.js';
import PatientFile from '../models/PatientFile.js';
import Resource from '../models/Resource.js';
import Ambulance from '../models/Ambulance.js';
// User n'est pas directement utilisé ici, mais gardé au cas où pour des évolutions.
// import { User } from '../models/User.js';

const router = express.Router();

const formatDateForContext = (dateString) => {
    if (!dateString) return 'non spécifiée';
    try {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return 'date invalide';
    }
};

const buildPatientContext = async (patientId, userQuery) => {
    console.log(`[BuildPatientCtx] Début pour patient ID: ${patientId}, Query: "${userQuery.substring(0,50)}..."`);
    const patient = await EmergencyPatient.findById(patientId).populate('assignedDoctor', 'username specialization');
    if (!patient) {
        console.warn(`[BuildPatientCtx] Patient non trouvé pour ID: ${patientId}`);
        return "Les informations pour ce patient n'ont pas pu être trouvées.";
    }

    let contextLines = [];

    // Informations de base de EmergencyPatient
    if (patient.firstName && patient.lastName) {
        contextLines.push(`Le nom complet du patient est ${patient.firstName} ${patient.lastName}.`);
    } else if (patient.firstName) {
        contextLines.push(`Le prénom du patient est ${patient.firstName}.`);
    }
    if (patient.dateOfBirth) {
        const birthDate = new Date(patient.dateOfBirth);
        if (!isNaN(birthDate)) {
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            contextLines.push(`Sa date de naissance est le ${birthDate.toLocaleDateString('fr-FR')}, il/elle a ${age} ans.`);
        }
    }
    if (patient.gender) contextLines.push(`Son genre est ${patient.gender}.`);
    if (patient.status) contextLines.push(`Son statut actuel est '${patient.status}'.`);
    if (patient.emergencyLevel) contextLines.push(`Son niveau d'urgence est '${patient.emergencyLevel}'.`);
    if (patient.currentSymptoms) contextLines.push(`Les symptômes principaux décrits par le patient sont : '${patient.currentSymptoms}'.`);
    if (patient.arrivalTime) contextLines.push(`Le patient est arrivé(e) le ${formatDateForContext(patient.arrivalTime)}.`);
    if (patient.patientCode) contextLines.push(`Son code patient est ${patient.patientCode}.`);

    if (patient.assignedDoctor) {
        let doctorInfoStr = `Le médecin assigné est Dr. ${patient.assignedDoctor.username}`;
        if (patient.assignedDoctor.specialization && String(patient.assignedDoctor.specialization).toLowerCase() !== 'undefined') {
            doctorInfoStr += `, spécialiste en ${patient.assignedDoctor.specialization}.`;
        } else {
            doctorInfoStr += ".";
        }
        contextLines.push(doctorInfoStr);
    } else {
        contextLines.push("Aucun médecin n'est formellement assigné à ce patient pour le moment.");
    }

    // Informations de MedicalRecord
    const medicalRecord = await MedicalRecord.findOne({ patientId: patient._id });
    if (medicalRecord) {
        if (medicalRecord.bloodType) {
            contextLines.push(`Son groupe sanguin est ${medicalRecord.bloodType}.`);
        } else {
            contextLines.push("Le groupe sanguin du patient n'est pas spécifié dans le dossier médical.");
        }
        if (medicalRecord.knownAllergies && medicalRecord.knownAllergies.length > 0 &&
            !(medicalRecord.knownAllergies.length === 1 && String(medicalRecord.knownAllergies[0]).toLowerCase().includes('none'))) { // Gère "none", "noneee"
            contextLines.push(`Les allergies connues du patient sont : ${medicalRecord.knownAllergies.join(', ')}.`);
        } else {
            contextLines.push("Aucune allergie connue n'est mentionnée dans le dossier médical du patient.");
        }
    } else {
        contextLines.push("Aucun dossier médical principal (contenant groupe sanguin ou allergies) n'a été trouvé pour ce patient.");
    }

    const lowerUserQuery = userQuery.toLowerCase();

    // Charger des détails spécifiques des PatientFile si la query le suggère
    if (lowerUserQuery.includes("signes vitaux") || lowerUserQuery.includes("vitals") || lowerUserQuery.includes("température") || lowerUserQuery.includes("tension") || lowerUserQuery.includes("pouls") || lowerUserQuery.includes("saturation")) {
        const vitalSignsFile = await PatientFile.findOne({ medicalRecord: medicalRecord?._id, type: "VitalSigns", isArchived: false }).sort({ dateRecorded: -1 });
        if (vitalSignsFile && vitalSignsFile.details?.vitalSigns) {
            let vitalsString = `Derniers signes vitaux enregistrés le ${formatDateForContext(vitalSignsFile.dateRecorded)}: `;
            const vs = vitalSignsFile.details.vitalSigns;
            if (vs.temperature != null) vitalsString += `Température ${vs.temperature}°C. `;
            if (vs.heartRate != null) vitalsString += `Pouls ${vs.heartRate}bpm. `;
            if (vs.bloodPressure?.systolic != null && vs.bloodPressure?.diastolic != null) vitalsString += `Tension ${vs.bloodPressure.systolic}/${vs.bloodPressure.diastolic}mmHg. `;
            if (vs.respiratoryRate != null) vitalsString += `Fréquence respiratoire ${vs.respiratoryRate}/min. `;
            if (vs.oxygenSaturation != null) vitalsString += `Saturation O2 ${vs.oxygenSaturation}%.`;
            contextLines.push(vitalsString.trim());
        } else {
            contextLines.push("Aucun enregistrement récent de signes vitaux n'a été trouvé pour ce patient.");
        }
    }

    if (lowerUserQuery.includes("diagnostic") || lowerUserQuery.includes("diagnostique")) {
         const diagnosticFile = await PatientFile.findOne({ medicalRecord: medicalRecord?._id, type: "Diagnostic", isArchived: false }).sort({ dateRecorded: -1 });
         if (diagnosticFile && diagnosticFile.details?.diagnosis) {
            contextLines.push(`Le diagnostic principal posé le ${formatDateForContext(diagnosticFile.dateRecorded)} est : '${diagnosticFile.details.diagnosis}'.`);
            if (diagnosticFile.details.diagnosticTests?.length > 0) {
                contextLines.push("Tests diagnostiques associés: " + diagnosticFile.details.diagnosticTests.map(t => `${t.testName || 'Test non nommé'} (Résultat: ${t.result || 'N/A'}, Date: ${formatDateForContext(t.date)})`).join('; '));
            }
         } else {
            contextLines.push("Aucun diagnostic principal récent n'a été enregistré pour ce patient.");
         }
    }
    
    if (lowerUserQuery.includes("médicament") || lowerUserQuery.includes("prescription") || lowerUserQuery.includes("traitement médicamenteux")) {
        const prescriptionFile = await PatientFile.findOne({ medicalRecord: medicalRecord?._id, type: "Prescription", isArchived: false }).sort({ dateRecorded: -1 });
        if (prescriptionFile && prescriptionFile.details?.medications?.length > 0) {
            let medString = `Médicaments prescrits (le ${formatDateForContext(prescriptionFile.dateRecorded)}): `;
            medString += prescriptionFile.details.medications.map(m => `${m.name || 'Médicament non nommé'} ${m.dosage || ''} ${m.frequency || ''} pendant ${m.duration || ''}`).join('; ');
            contextLines.push(medString.trim());
        } else {
            contextLines.push("Aucune prescription récente trouvée pour ce patient.");
        }
    }
    
    if (lowerUserQuery.includes("triage") || lowerUserQuery.includes("plainte principale")) {
        const triageFile = await PatientFile.findOne({ medicalRecord: medicalRecord?._id, type: "Triage", isArchived: false }).sort({ dateRecorded: -1 });
        if (triageFile) {
            let triageString = `Informations du triage (le ${formatDateForContext(triageFile.dateRecorded)}): `;
            if (triageFile.details?.priorityLevel) triageString += `Niveau de priorité: ${triageFile.details.priorityLevel}. `;
            if (triageFile.details?.chiefComplaint) triageString += `Plainte principale: ${triageFile.details.chiefComplaint}. `;
            if (triageFile.notes) triageString += `Notes additionnelles de triage: ${triageFile.notes}.`;
            contextLines.push(triageString.trim());
        } else {
            contextLines.push("Aucune information de triage récente trouvée pour ce patient.");
        }
    }
    
    const finalContext = contextLines.join(' ').trim();
    console.log(`[BuildPatientCtx] Contexte final (premiers 500 chars):\n"${finalContext.substring(0, 500)}..."`);
    return finalContext;
};


const buildResourceContext = async (resourceId) => {
    const resource = await Resource.findById(resourceId);
    if (!resource) return "Ressource non trouvée.";
    return `La ressource est ${resource.name}, de type ${resource.type}. Son statut actuel est ${resource.status}. La quantité disponible est de ${resource.quantity}. Elle est localisée à ${resource.location}.`;
};

const buildAmbulanceContext = async (ambulanceId) => {
    const ambulance = await Ambulance.findById(ambulanceId).populate('team', 'username');
    if (!ambulance) return "Ambulance non trouvée.";
    let teamInfo = ambulance.team && ambulance.team.length > 0 ? ambulance.team.map(member => member.username).join(', ') : 'Aucune personne assignée';
    let context = `L'ambulance est ${ambulance.name}. Son statut est ${ambulance.status}. `;
    if (ambulance.latitude != null && ambulance.longitude != null) {
        context += `Sa localisation actuelle est latitude ${ambulance.latitude}, longitude ${ambulance.longitude}. `;
    }
    if (ambulance.destination) {
        context += `Sa destination est ${ambulance.destination}. `;
    } else {
        context += `Aucune destination n'est actuellement définie. `;
    }
    context += `L'équipe assignée est ${teamInfo}.`;
    return context;
};


router.post('/staff-query', authenticateToken, authorize(['Doctor', 'Nurse', 'Administrator']), async (req, res) => {
    const { targetType, targetId, userQuery } = req.body;
    
    console.log(`[Staff Query Route] Requête reçue: targetType=${targetType}, targetId=${targetId}, userQuery="${userQuery}" par UserID: ${req.user.id}`);

    if (!targetType || !targetId || !userQuery) {
        console.warn("[Staff Query Route] Paramètres manquants:", req.body);
        return res.status(400).json({ message: "targetType, targetId, et userQuery sont requis." });
    }
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        console.warn(`[Staff Query Route] targetId invalide: ${targetId}`);
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
                console.warn(`[Staff Query Route] targetType non supporté: ${targetType}`);
                return res.status(400).json({ message: "targetType non supporté." });
        }

        if (context.includes("non trouvé") || context.includes("non trouvée")) {
             console.log(`[Staff Query Route] Entité cible non trouvée pour targetId ${targetId}. Contexte: "${context}"`);
             return res.status(404).json({ answer: context, score: 0 });
        }
        if (!context.trim()) {
            console.log(`[Staff Query Route] Contexte vide généré pour targetId ${targetId} et query "${userQuery}".`);
            return res.status(200).json({ answer: "Je n'ai pas trouvé d'informations spécifiques pour cette requête dans le dossier.", score: 0 });
        }

        // *** L'ORDRE EST IMPORTANT ICI : (question, contexte) ***
        const qaResult = await getAnswerFromContext(userQuery, context); 

        console.log(`[Staff Query Route] Réponse QA pour query "${userQuery}":`, qaResult);
        res.json(qaResult);

    } catch (error) {
        console.error("[Staff Query Route] Erreur interne lors du traitement de la requête chatbot:", error);
        res.status(500).json({ message: "Erreur du serveur lors du traitement de la requête chatbot.", details: error.message });
    }
});

export default router;