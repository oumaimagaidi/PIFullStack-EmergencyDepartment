// routes/emergencyPatients.js
import express from 'express';
import mongoose from 'mongoose';
import EmergencyPatient from '../models/EmergencyPatient.js';
import { User } from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';
import PatientFile from '../models/PatientFile.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import sendSMS from '../sendSMS.js'; // Ensure sendSMS is imported
import { getEstimatedWaitTime } from '../services/waitTimeService.js';
const router = express.Router();

// Helper function to find an available doctor
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
// Handles patient registration/update, doctor assignment, WS notifications, and SMS to patient about assignment
router.post('/', async (req, res) => {
  const io = req.io;
  const userSockets = req.userSockets;

  try {
    const { firstName, lastName, email, currentSymptoms, emergencyLevel, address } = req.body;

    const existingPatient = await EmergencyPatient.findOne({ firstName, lastName, email });

    let patient;
    let isNew = !existingPatient;

    if (existingPatient) {
      console.log(`Patient ${firstName} ${lastName} existe déjà. Mise à jour.`);
      patient = await EmergencyPatient.findByIdAndUpdate(
        existingPatient._id, { ...req.body, status: 'Demande Enregistrée', isNewPatient: false, $push: { previousVisits: { symptoms: currentSymptoms || 'N/A', visitDate: new Date() } } }, { new: true }
      );
    } else {
      console.log(`Nouveau patient: ${firstName} ${lastName}. Création.`);
      patient = new EmergencyPatient({ ...req.body, isNewPatient: true });
      await patient.save();
    }

    const availableDoctor = await findAvailableDoctor();
    let assignedDoctorDetails = null;

    if (availableDoctor) {
      patient.assignedDoctor = availableDoctor._id;
      patient.status = 'Médecin Assigné'; // Update status
      await patient.save(); // Save assignment
      try {
        await User.findByIdAndUpdate(availableDoctor._id, { isAvailable: false });
        console.log(`Médecin ${availableDoctor.username} (ID: ${availableDoctor._id}) mis à jour à 'Occupé'.`);
      } catch (doctorUpdateError) {
        console.error(`ERREUR CRITIQUE: Échec MAJ dispo médecin ${availableDoctor._id}.`, doctorUpdateError);
      }

      console.log(`Médecin ${availableDoctor.username} assigné au patient ${patient.firstName} ${patient.lastName}.`);

      assignedDoctorDetails = {
        _id: availableDoctor._id,
        username: availableDoctor.username,
        specialization: availableDoctor.specialization,
        // Add other details if needed in response
      };

      // --- WebSocket Notifications ---
      const doctorAssignmentPayload = { type: 'doctor_assignment', message: `You are assigned to patient: ${patient.firstName} ${patient.lastName}.`, patientId: patient._id, patientName: `${patient.firstName} ${patient.lastName}` };
      const nurseNotificationPayload = { type: 'new_emergency_patient', message: `Patient: ${patient.firstName} ${patient.lastName} assigned to Dr. ${availableDoctor.username}.`, patientId: patient._id, patientName: `${patient.firstName} ${patient.lastName}` };
      const doctorSocketId = userSockets.get(availableDoctor._id.toString());
      if (doctorSocketId) { io.to(doctorSocketId).emit('notification', doctorAssignmentPayload); console.log(`📬 WS Notif assignation envoyée médecin ${availableDoctor.username}`); }
      else { console.log(`⚠️ Médecin assigné ${availableDoctor.username} non connecté (WS).`); }
      io.to('nurse-room').emit('notification', nurseNotificationPayload); console.log(`📬 WS Notif envoyée infirmières.`);
      // --- End WebSocket Notifications ---


      // --- ✨ SMS 1: SEND TO PATIENT ABOUT ASSIGNED DOCTOR ---
      const patientPhoneNumber = patient.phoneNumber; // Get patient's number
      if (patientPhoneNumber) {
        const smsMessageToPatient = `Emergency Update: Dr. ${availableDoctor.username} (${availableDoctor.specialization || 'Doctor'}) has been assigned to your case. Please await further instructions or contact.`;
        try {
          console.log(`📲 Attempting SMS to PATIENT ${patient.firstName} ${patient.lastName} at ${patientPhoneNumber} about assignment...`);
          const smsResultPatient = await sendSMS(smsMessageToPatient, patientPhoneNumber);
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
      // --- End SMS to Patient ---


    } else {
      // Logic when no doctor is available (WS notifications)
      console.warn(`⚠️ Aucun médecin disponible pour ${patient.firstName} ${patient.lastName}.`);
      const notificationPayloadNoDoctor = { type: 'new_emergency_patient_no_doctor', message: `New emergency patient registered: ${patient.firstName} ${patient.lastName}. No doctor currently available.`, patientId: patient._id, patientName: `${patient.firstName} ${patient.lastName}`, symptoms: currentSymptoms, emergencyLevel: emergencyLevel, timestamp: new Date() };
      io.to('nurse-room').emit('notification', notificationPayloadNoDoctor);
      io.to('doctor-room').emit('notification', notificationPayloadNoDoctor);
    }

    // Fetch final patient details for the response
    const responsePatient = await EmergencyPatient.findById(patient._id)
      .populate('assignedDoctor', 'username specialization email profileImage phoneNumber')
      .populate('medicalRecord', 'accessCode');

    res.status(201).json({
      patient: responsePatient,
      isNewPatient: isNew,
      patientCode: responsePatient.patientCode
    });

  } catch (error) {
    console.error("❌ Erreur création/mise à jour patient d'urgence:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: "Erreur de validation", details: messages });
    } else {
      res.status(500).json({ message: 'Erreur Serveur Interne', error: error.message });
    }
  }
});


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
        shouldDisplay: false
      });
    }
    res.status(200).json({
      accessCode: medicalRecord.accessCode,
      shouldDisplay: true
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


// PUT /:id/status - Update status, send WS notifications, create medical record, AND SEND STATUS SMS TO PATIENT
router.put('/:id/status', authenticateToken, async (req, res) => {
  const io = req.io;
  const userSockets = req.userSockets;
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id; // ID of the staff member making the change

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
    ).populate('assignedDoctor', 'username specialization email profileImage'); // Keep populate

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // --- WebSocket Notification Logic ---
    const statusUpdatePayload = {
      type: 'patient_status_update',
      message: `Statut du patient ${updatedPatient.firstName} ${updatedPatient.lastName} mis à jour à: ${status}.`,
      patientId: updatedPatient._id,
      patientName: `${updatedPatient.firstName} ${updatedPatient.lastName}`,
      newStatus: status,
      timestamp: new Date()
    };
    if (updatedPatient.assignedDoctor) {
      const doctorSocketId = userSockets.get(updatedPatient.assignedDoctor._id.toString());
      if (doctorSocketId) {
        io.to(doctorSocketId).emit('notification', statusUpdatePayload);
        console.log(`📬 Notification de statut envoyée au médecin ${updatedPatient.assignedDoctor.username}`);
      }
    }
    io.to('nurse-room').emit('notification', statusUpdatePayload);
    console.log(`📬 Notification de statut envoyée à toutes les infirmières connectées.`);
    // --- End WebSocket Notification Logic ---


    // --- Medical Record Creation Logic (CORRECTED) ---
    if (['Médecin En Route', 'Traité'].includes(status)) {
      let medicalRecord = await MedicalRecord.findOne({ patientId: id });
      if (!medicalRecord) {
        console.log(`Création du dossier médical pour le patient ${id}...`);

        // Prepare data, conditionally adding bloodType
        const medicalRecordData = {
          patientId: id,
          creator: updatedPatient.assignedDoctor?._id || userId,
          emergencyContact: { phone: updatedPatient.emergencyContact },
          knownAllergies: updatedPatient.allergies ? updatedPatient.allergies.split(',').map(s => s.trim()) : [],
          // DO NOT default bloodType here
        };

        // Only add bloodType if it exists on the source patient
        if (updatedPatient.bloodType) {
          medicalRecordData.bloodType = updatedPatient.bloodType;
        } else {
          console.log(`ℹ️ Blood type non fourni pour patient ${id}, sera omis du dossier médical.`);
          // If bloodType is REQUIRED in MedicalRecord schema, save() will fail, which is correct.
        }

        medicalRecord = new MedicalRecord(medicalRecordData);
        await medicalRecord.save(); // This might still fail if bloodType is required and missing
        console.log(`Dossier médical ${medicalRecord._id} créé.`);

        await EmergencyPatient.findByIdAndUpdate(id, { medicalRecord: medicalRecord._id });

        console.log(`Création du fichier PatientInformation pour le dossier ${medicalRecord._id}...`);
        const patientFile = new PatientFile({
          medicalRecord: medicalRecord._id,
          creator: updatedPatient.assignedDoctor?._id || userId,
          type: "PatientInformation",
          details: { // Ensure all relevant details are copied
            patientInfo: {
              firstName: updatedPatient.firstName,
              lastName: updatedPatient.lastName,
              dateOfBirth: updatedPatient.dateOfBirth,
              gender: updatedPatient.gender,
              phoneNumber: updatedPatient.phoneNumber,
              email: updatedPatient.email,
              address: updatedPatient.address,
              emergencyContact: updatedPatient.emergencyContact,
              insuranceInfo: updatedPatient.insuranceInfo,
              allergies: updatedPatient.allergies,
              currentMedications: updatedPatient.currentMedications,
              medicalHistory: updatedPatient.medicalHistory,
              currentSymptoms: updatedPatient.currentSymptoms,
              painLevel: updatedPatient.painLevel,
              emergencyLevel: updatedPatient.emergencyLevel,
            }
          }
        });
        await patientFile.save();
        console.log(`Fichier PatientInformation ${patientFile._id} créé.`);
      }
    }
    // --- End Medical Record Creation Logic ---


    // --- ✨ SMS 2: SEND STATUS UPDATE TO PATIENT ---
    const patientPhoneNumber = updatedPatient.phoneNumber; // Get phone number from the updated patient doc
    if (patientPhoneNumber) {
      const smsMessage = `Emergency Update: Your request status has been updated to: ${status}.`;
      try {
        console.log(`📲 Attempting status update SMS to PATIENT ${updatedPatient.firstName} ${updatedPatient.lastName} at ${patientPhoneNumber}...`);
        const smsResult = await sendSMS(smsMessage, patientPhoneNumber);
        if (smsResult.success) {
          console.log(`✅ Status SMS sent successfully to PATIENT ${updatedPatient._id}.`);
        } else {
          console.error(`⚠️ Failed status SMS to PATIENT ${updatedPatient._id}: ${smsResult.message || 'Unknown error'}`);
        }
      } catch (smsError) {
        console.error(`❌ Critical error sending status SMS to PATIENT ${updatedPatient._id}:`, smsError);
      }
    } else {
      console.warn(`⚠️ Cannot send status SMS to patient ${updatedPatient._id}: Phone number missing.`);
    }
    // --- End SMS to Patient ---

    res.status(200).json(updatedPatient); // Send updated patient data back

  } catch (error) {
    console.error("❌ Erreur mise à jour statut:", error);
    // Send specific validation error back if possible
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => `${val.path}: ${val.message}`);
      // Log the specific validation error on the backend
      console.error("Validation Error during MedicalRecord save:", error.errors);
      return res.status(400).json({ message: "Erreur de validation lors de la création du dossier médical", details: messages });
    }
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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

    const result = { ...medicalRecord, patientFiles: patientFiles };

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
      createdAt: { $gte: today, $lt: tomorrow }
    });
    res.status(200).json({ today: patientsToday });
  } catch (error) {
    console.error("Erreur récupération nombre de patients aujourd'hui:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
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
    // Envoyer l'erreur spécifique si le patient n'est pas trouvé
    if (error.message === "Patient non trouvé.") {
      return res.status(404).json({ message: error.message });
    }
    // Sinon, erreur serveur générique
    res.status(500).json({ message: "Erreur lors du calcul du temps d'attente estimé." });
  }
});
// --- FIN NOUVELLE ROUTE ---
export default router;