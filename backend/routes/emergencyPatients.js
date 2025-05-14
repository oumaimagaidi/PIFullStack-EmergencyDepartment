// backend/routes/emergencyPatients.js
import express from 'express';
import mongoose from 'mongoose';
import EmergencyPatient from '../models/EmergencyPatient.js';
import { User } from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';
import PatientFile from '../models/PatientFile.js';
import Notification from '../models/Notification.js'; // <--- AJOUTER L'IMPORT
import { authenticateToken } from '../middleware/authMiddleware.js';
import sendSMS from '../sendSMS.js';
import { getEstimatedWaitTime } from '../services/waitTimeService.js';

const router = express.Router();

// Helper function to find an available doctor (inchangé)
const findAvailableDoctor = async () => {
  try {
    const doctor = await User.findOne({
      role: 'Doctor',
      isValidated: true,
      isAvailable: true,
    });
    return doctor;
  } catch (error) {
    console.error("Erreur lors de la recherche d'un médecin disponible:", error);
    return null;
  }
};

// POST route to create/update emergency patient registration
router.post('/', async (req, res) => {
  const io = req.io;
  const userSockets = req.userSockets;

  try {
    const { firstName, lastName, email, currentSymptoms, emergencyLevel, address, phoneNumber } = req.body;
    const existingPatient = await EmergencyPatient.findExistingPatient(firstName, lastName, email);
    let patient;
    let isNew = !existingPatient;

    if (existingPatient) {
      console.log(`Patient ${firstName} ${lastName} existe déjà. Mise à jour.`);
      patient = await EmergencyPatient.findByIdAndUpdate(
        existingPatient._id,
        { /* ...data... */ }, { new: true }
      );
    } else {
      console.log(`Nouveau patient: ${firstName} ${lastName}. Création.`);
      patient = new EmergencyPatient({ ...req.body, isNewPatient: true });
      await patient.save();
    }

    const availableDoctor = await findAvailableDoctor();
    // let assignedDoctorDetails = null; // Pas utilisé directement dans la réponse JSON plus tard

    if (availableDoctor) {
      patient.assignedDoctor = availableDoctor._id;
      patient.status = 'Médecin Assigné';
      await patient.save();
      try {
        await User.findByIdAndUpdate(availableDoctor._id, { isAvailable: false });
        console.log(`Médecin ${availableDoctor.username} (ID: ${availableDoctor._id}) mis à jour à 'Occupé'.`);
      } catch (doctorUpdateError) {
        console.error(`ERREUR CRITIQUE: Échec MAJ dispo médecin ${availableDoctor._id}.`, doctorUpdateError);
      }
      console.log(`Médecin ${availableDoctor.username} assigné au patient ${patient.firstName} ${patient.lastName}.`);

      // --- DÉBUT MODIFICATION NOTIFICATION MÉDECIN ---
      const doctorAssignmentPayload = {
        type: 'doctor_assignment',
        message: `You have been assigned to patient : ${patient.firstName} ${patient.lastName}.`,
        recipientId: availableDoctor._id, // Important pour la sauvegarde et le contexte
        relatedEntityId: patient._id,
        relatedEntityType: 'EmergencyPatient',
        patientName: `${patient.firstName} ${patient.lastName}` // Utile pour le toast frontend
      };

      try {
        const newDbNotificationForDoctor = new Notification({
            recipientId: doctorAssignmentPayload.recipientId,
            message: doctorAssignmentPayload.message,
            type: doctorAssignmentPayload.type,
            relatedEntityId: doctorAssignmentPayload.relatedEntityId,
            relatedEntityType: doctorAssignmentPayload.relatedEntityType
        });
        await newDbNotificationForDoctor.save();
        console.log(`💾 Notification d'assignation sauvegardée en BDD pour médecin ${availableDoctor._id}`);
        // Émettre le document sauvegardé ou un payload enrichi si nécessaire
        // Pour la simplicité, on peut émettre le même payload, le frontend le traitera
        // ou émettre newDbNotificationForDoctor.toObject() si vous voulez toutes les infos de la BDD.
      } catch (dbError) {
          console.error("❌ Erreur sauvegarde notification médecin en BDD:", dbError);
      }
      // --- FIN MODIFICATION NOTIFICATION MÉDECIN ---

      // --- DÉBUT MODIFICATION NOTIFICATION INFIRMIÈRE ---
      // Pour les infirmières, on émet à une room. Si on veut une notif persistante par infirmière,
      // il faudrait itérer sur les infirmières connectées à la room et créer une notif pour chacune.
      // Pour l'instant, on se contente de l'émission socket.
      const nurseNotificationPayload = {
        type: 'new_emergency_case', // ou 'patient_assigned_to_doctor'
        message: `Patient: ${patient.firstName} ${patient.lastName} (Niveau: ${patient.emergencyLevel}) assigné à Dr. ${availableDoctor.username}.`,
        patientId: patient._id, // Garder patientId pour le toast frontend
        patientName: `${patient.firstName} ${patient.lastName}`,
        emergencyLevel: patient.emergencyLevel, // Ajouter le niveau pour le toast
        // Pas de recipientId spécifique pour la room, donc pas de sauvegarde BDD simple ici
        // (sauf si on a un ID de groupe/rôle pour les infirmières)
        relatedEntityId: patient._id,
        relatedEntityType: 'EmergencyPatient'
      };
      // --- FIN MODIFICATION NOTIFICATION INFIRMIÈRE ---


      const doctorSocketId = userSockets.get(availableDoctor._id.toString());
      if (doctorSocketId) {
        // Envoyer le document sauvegardé ou un payload enrichi qui inclut l'ID de la notif BDD
        io.to(doctorSocketId).emit('notification', doctorAssignmentPayload); 
        console.log(`📬 WS Notif assignation envoyée médecin ${availableDoctor.username}`);
      } else {
        console.log(`⚠️ Médecin assigné ${availableDoctor.username} non connecté (WS).`);
      }
      io.to('nurse-room').emit('notification', nurseNotificationPayload);
      console.log(`📬 WS Notif envoyée infirmières (pour affichage en direct).`);

      // ... (SMS logic unchanged) ...
       if (phoneNumber) {
        const smsMessageToPatient = `Emergency Update: Dr. ${availableDoctor.username} (${availableDoctor.specialization || 'Doctor'}) has been assigned to your case. Please await further instructions or contact.`;
        try {
          console.log(`📲 Attempting SMS to PATIENT ${patient.firstName} ${patient.lastName} at ${phoneNumber} about assignment...`);
          const smsResultPatient = await sendSMS(smsMessageToPatient, phoneNumber);
          if (smsResultPatient.success) {
            console.log(`✅ Assignment SMS sent successfully to PATIENT ${patient.firstName} ${patient.lastName}.`);
          } else {
            console.error(`⚠️ Failed assignment SMS to PATIENT ${patient.firstName} ${patient.lastName}: ${smsResultPatient.message || 'Unknown error'}`);
          }
        } catch (smsErrorPatient) {
          console.error(`❌ Critical error sending assignment SMS to PATIENT ${patient.firstName} ${patient.lastName}:`, smsErrorPatient);
        }
      } else {
        console.warn(`⚠️ Cannot send assignment SMS to patient ${patient.firstName} ${patient.lastName}: Phone number missing.`);
      }

    } else { // No available doctor
      console.warn(`⚠️ Aucun médecin disponible pour ${patient.firstName} ${patient.lastName}.`);
      const notificationPayloadNoDoctor = {
        type: 'unassigned_emergency_case', // Type plus spécifique
        message: `Nouveau patient ${patient.firstName} ${patient.lastName} (Niveau: ${patient.emergencyLevel}) en attente. Aucun médecin disponible pour le moment.`,
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        symptoms: currentSymptoms,
        emergencyLevel: emergencyLevel,
        timestamp: new Date(),
        relatedEntityId: patient._id,
        relatedEntityType: 'EmergencyPatient'
      };
      // Émettre aux administrateurs et/ou infirmières et/ou docteurs qui pourraient devenir disponibles
      io.to('nurse-room').emit('notification', notificationPayloadNoDoctor);
      io.to('doctor-room').emit('notification', notificationPayloadNoDoctor); // Les médecins verront en attente
      io.to('administrator-room').emit('notification', notificationPayloadNoDoctor); // Si les admins suivent ça

      // Optionnel: Sauvegarder une notification "système" ou pour les admins
      // try {
      //   const adminUsers = await User.find({ role: 'Administrator' });
      //   for (const admin of adminUsers) {
      //     const adminNotification = new Notification({
      //       recipientId: admin._id,
      //       message: notificationPayloadNoDoctor.message,
      //       type: notificationPayloadNoDoctor.type,
      //       relatedEntityId: patient._id,
      //       relatedEntityType: 'EmergencyPatient'
      //     });
      //     await adminNotification.save();
      //   }
      //   console.log(`💾 Notification "aucun médecin dispo" sauvegardée pour les admins.`);
      // } catch (dbError) {
      //   console.error("❌ Erreur sauvegarde notification admin en BDD:", dbError);
      // }
    }

    const responsePatient = await EmergencyPatient.findById(patient._id)
      .populate('assignedDoctor', 'username specialization email profileImage phoneNumber')
      .populate('medicalRecord', 'accessCode');

    res.status(201).json({
      patient: responsePatient,
      isNewPatient: isNew,
      patientCode: responsePatient.patientCode,
    });

  } catch (error) {
    // ... (error handling unchanged) ...
    console.error("❌ Erreur création/mise à jour patient d'urgence:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: "Erreur de validation", details: messages });
    } else {
      res.status(500).json({ message: 'Erreur Serveur Interne', error: error.message });
    }
  }
});


// PUT /:id/status
router.put('/:id/status', authenticateToken, async (req, res) => {
  const io = req.io;
  const userSockets = req.userSockets;
  try {
    const { id } = req.params; // ID du EmergencyPatient
    const { status } = req.body; // Nouveau statut
    // const userId = req.user.id; // ID de l'utilisateur effectuant l'action (infirmière/médecin)

    // ... (validations inchangées) ...
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }
    const allowedStatuses = ['Demande Enregistrée', 'En Cours d\'Examen', 'Médecin Assigné', 'Médecin En Route', 'Traité', 'Annulé'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }


    const updatedPatient = await EmergencyPatient.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('assignedDoctor', 'username specialization email profileImage');

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // --- DÉBUT MODIFICATION NOTIFICATION DE STATUT ---
    const statusUpdatePayloadForSocket = { // Ce qui est envoyé via socket
      type: 'patient_status_update',
      message: `Statut du patient ${updatedPatient.firstName} ${updatedPatient.lastName} mis à jour à: ${status}.`,
      patientId: updatedPatient._id,
      patientName: `${updatedPatient.firstName} ${updatedPatient.lastName}`,
      newStatus: status,
      timestamp: new Date(),
      relatedEntityId: updatedPatient._id, // Lier à l'EmergencyPatient
      relatedEntityType: 'EmergencyPatient'
    };

    // Sauvegarder la notification en BDD pour le médecin assigné (s'il y en a un)
    if (updatedPatient.assignedDoctor?._id) {
        try {
            const newDbNotificationForDoctor = new Notification({
                recipientId: updatedPatient.assignedDoctor._id,
                message: statusUpdatePayloadForSocket.message,
                type: statusUpdatePayloadForSocket.type,
                relatedEntityId: statusUpdatePayloadForSocket.relatedEntityId,
                relatedEntityType: statusUpdatePayloadForSocket.relatedEntityType
            });
            await newDbNotificationForDoctor.save();
            console.log(`💾 Notification de statut sauvegardée en BDD pour médecin ${updatedPatient.assignedDoctor._id}`);
            
            // Émettre au médecin spécifique
            const doctorSocketId = userSockets.get(updatedPatient.assignedDoctor._id.toString());
            if (doctorSocketId) {
                // On peut envoyer le document complet de la BDD ou le payload simple
                io.to(doctorSocketId).emit('notification', newDbNotificationForDoctor.toObject());
                console.log(`📬 Notification de statut (BDD) envoyée au médecin ${updatedPatient.assignedDoctor.username}`);
            } else {
                 console.log(`⚠️ Médecin ${updatedPatient.assignedDoctor.username} non connecté (WS) pour notif statut.`);
            }
        } catch (dbError) {
            console.error("❌ Erreur sauvegarde notification statut médecin en BDD:", dbError);
        }
    }

    // Émettre à la room des infirmières (pour affichage en direct, pas de sauvegarde BDD par défaut pour la room)
    io.to('nurse-room').emit('notification', statusUpdatePayloadForSocket);
    console.log(`📬 Notification de statut (socket) envoyée à toutes les infirmières connectées.`);
    // --- FIN MODIFICATION ---

    // ... (Medical Record Creation Logic et SMS Logic inchangés) ...
     if (['Médecin En Route', 'Traité'].includes(status)) {
      let medicalRecord = await MedicalRecord.findOne({ patientId: id });
      if (!medicalRecord) {
        console.log(`Création du dossier médical pour le patient ${id}...`);
        const medicalRecordData = { /* ... */ };
        // ... création du dossier ...
      }
    }
    const patientPhoneNumber = updatedPatient.phoneNumber;
    if (patientPhoneNumber) {
      const smsMessage = `Emergency Update: Your request status has been updated to: ${status}.`;
      // ... envoi SMS ...
    }

    res.status(200).json(updatedPatient);
  } catch (error) {
    // ... (error handling inchangé) ...
    console.error("❌ Erreur mise à jour statut:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => `${val.path}: ${val.message}`);
      console.error("Validation Error during MedicalRecord save:", error.errors);
      return res.status(400).json({ message: "Erreur de validation lors de la création du dossier médical", details: messages });
    }
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// ... (autres routes GET, DELETE, STATS inchangées) ...
// GET /:id/medical-access-code
router.get('/:id/medical-access-code', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID patient invalide" });
  }
  try {
    const patient = await EmergencyPatient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
    const medicalRecord = await MedicalRecord.findOne({ patientId: id })
      .select('accessCode')
      .lean();
    if (!medicalRecord) {
      return res.status(404).json({
        message: "Dossier médical non trouvé",
        shouldDisplay: false,
      });
    }
    res.status(200).json({
      accessCode: medicalRecord.accessCode,
      shouldDisplay: true,
    });
  } catch (error) {
    console.error("Erreur récupération code accès:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// GET /
router.get('/', async (req, res) => {
  try {
    const emergencyPatients = await EmergencyPatient.find()
      .populate('assignedDoctor', 'username specialization')
      .sort({ createdAt: -1 });
    res.status(200).json(emergencyPatients);
  } catch (error) {
    console.error("Erreur récupération patients:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /:id/details
router.get('/:id/details', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }
  try {
    const patient = await EmergencyPatient.findById(id)
      .populate('assignedDoctor', 'username specialization email profileImage');
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
    res.status(200).json(patient);
  } catch (error) {
    console.error("Erreur détails patient:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
// GET /:id/medical-record
router.get('/:id/medical-record', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID patient invalide" });
  }
  try {
    const patient = await EmergencyPatient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    const medicalRecord = await MedicalRecord.findOne({ patientId: id })
      .populate('patientId', 'firstName lastName dateOfBirth gender phoneNumber email address')
      .lean();

    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé pour ce patient" });
    }

    if (medicalRecord.creator) {
      try {
        medicalRecord.creator = await User.findById(medicalRecord.creator)
          .select('username role specialization')
          .lean();
      } catch (userError) {
        console.warn(`Could not populate creator ${medicalRecord.creator}: ${userError.message}`);
        medicalRecord.creator = { _id: medicalRecord.creator, username: 'Utilisateur inconnu' };
      }
    }

    const patientFiles = await PatientFile.find({ medicalRecord: medicalRecord._id })
      .populate('creator', 'username role')
      .sort({ createdAt: -1 })
      .lean();

    const result = { ...medicalRecord, patientFiles };

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur récupération dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }
  try {
    const deletedPatient = await EmergencyPatient.findByIdAndDelete(id);
    if (!deletedPatient) return res.status(404).json({ message: "Patient non trouvé" });

    if (deletedPatient.assignedDoctor) {
      try {
        await User.findByIdAndUpdate(deletedPatient.assignedDoctor, { isAvailable: true });
        console.log(`✅ Médecin ${deletedPatient.assignedDoctor} rendu disponible après suppression du cas ${id}.`);
      } catch (docError) {
        console.error(`⚠️ Erreur lors de la remise à dispo du médecin ${deletedPatient.assignedDoctor}: ${docError.message}`);
      }
    }
    res.status(200).json({ message: "Patient d'urgence supprimé avec succès", deletedId: id });
  } catch (error) {
    console.error("Erreur suppression patient:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// GET /by-doctor/:doctorId
router.get('/by-doctor/:doctorId', authenticateToken, async (req, res) => {
  const { doctorId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: "ID médecin invalide" });
  }
  try {
    const patients = await EmergencyPatient.find({ assignedDoctor: doctorId })
      .populate('assignedDoctor', 'username specialization email profileImage')
      .populate('medicalRecord', '_id')
      .sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    console.error("Erreur récupération patients par médecin:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// GET /stats/total
router.get('/stats/total', async (req, res) => {
  try {
    const totalPatients = await EmergencyPatient.countDocuments();
    res.status(200).json({ total: totalPatients });
  } catch (error) {
    console.error("Erreur récupération nombre total de patients:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /stats/today
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const patientsToday = await EmergencyPatient.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    res.status(200).json({ today: patientsToday });
  } catch (error) {
    console.error("Erreur récupération nombre de patients aujourd'hui:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /:id/estimated-wait-time
router.get('/:id/estimated-wait-time', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID patient invalide" });
  }
  try {
    const estimatedTime = await getEstimatedWaitTime(id);
    res.json({ estimatedWaitTime: estimatedTime });
  } catch (error) {
    console.error(`Erreur API get wait time pour ${id}:`, error);
    if (error.message === "Patient non trouvé.") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors du calcul du temps d'attente estimé." });
  }
});

// GET /stats/levels
router.get('/stats/levels', async (req, res) => {
  try {
    const stats = await EmergencyPatient.getEmergencyLevelStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /stats/trends
router.get('/stats/trends', async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    const trends = await EmergencyPatient.getEmergencyTrends(period);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;