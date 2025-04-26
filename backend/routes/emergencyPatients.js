import express from 'express';
import mongoose from 'mongoose';
import EmergencyPatient from '../models/EmergencyPatient.js';
import { User } from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js'; // Assurez-vous que c'est importé
import PatientFile from '../models/PatientFile.js'; // Assurez-vous que c'est importé
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

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

// Nouvelle route POST avec vérification des doublons
router.post('/', async (req, res) => {
  try {
      const { firstName, lastName, email } = req.body;
      
      // Vérifier si le patient existe déjà
      const existingPatient = await EmergencyPatient.findExistingPatient(firstName, lastName, email);
      let patient;

      if (existingPatient) {
          // Mettre à jour le patient existant
          patient = await EmergencyPatient.findByIdAndUpdate(
              existingPatient._id, 
              { 
                  ...req.body, 
                  isNewPatient: false,
                  $push: {
                      previousVisits: {
                          symptoms: req.body.currentSymptoms,
                          doctor: existingPatient.assignedDoctor
                      }
                  }
              },
              { new: true }
          );
      } else {
          // Créer un nouveau patient
          patient = new EmergencyPatient(req.body);
          await patient.save();
      }

      // Assigner un médecin disponible
      const availableDoctor = await findAvailableDoctor();
      if (availableDoctor) {
          patient.assignedDoctor = availableDoctor._id;
          await patient.save();
          await User.findByIdAndUpdate(availableDoctor._id, { isAvailable: false });
      }

      const response = await EmergencyPatient.findById(patient._id)
          .populate('assignedDoctor', 'username specialization email profileImage')
          .populate('medicalRecord', 'accessCode');

      res.status(201).json({
          patient: response,
          isNewPatient: !existingPatient,
          patientCode: response.patientCode
      });

  } catch (error) {
      console.error("Erreur création patient:", error);
      res.status(500).json({ message: 'Erreur Serveur Interne', error: error.message });
  }
});
// Ajoutez cette nouvelle route à votre fichier emergencyPatient.js
/**
 * @route GET /api/emergency-patients/:id/medical-access-code
 * @description Récupère le code d'accès du dossier médical d'un patient d'urgence
 * @access Public
 */
router.get('/:id/medical-access-code', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID patient invalide" });
  }

  try {
    // 1. Vérifier que le patient existe
    const patient = await EmergencyPatient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // 2. Vérifier si un dossier médical existe
    const medicalRecord = await MedicalRecord.findOne({ patientId: id })
      .select('accessCode')
      .lean();

    if (!medicalRecord) {
      return res.status(404).json({ 
        message: "Dossier médical non trouvé",
        shouldDisplay: false
      });
    }

    // 3. Retourner le code d'accès
    res.status(200).json({
      accessCode: medicalRecord.accessCode,
      shouldDisplay: true
    });

  } catch (error) {
    console.error("Erreur récupération code accès:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const emergencyPatients = await EmergencyPatient.find();
    res.status(200).json(emergencyPatients);
  } catch (error) {
    console.error("Erreur récupération patients:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

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

// Route pour mettre à jour le statut et créer le dossier médical si nécessaire
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;

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
      ).populate('assignedDoctor', 'username specialization email');

      if (!updatedPatient) {
          return res.status(404).json({ message: "Patient non trouvé" });
      }

      // Création du dossier médical si nécessaire
      if (['Médecin En Route', 'Traité'].includes(status)) {
          let medicalRecord = await MedicalRecord.findOne({ patientId: id });

          if (!medicalRecord) {
              medicalRecord = new MedicalRecord({
                  patientId: id,
                  creator: updatedPatient.assignedDoctor || req.user._id,
                  emergencyContact: { phone: updatedPatient.emergencyContact },
                  knownAllergies: updatedPatient.allergies ? updatedPatient.allergies.split(',') : [],
              });
              await medicalRecord.save();

              updatedPatient.medicalRecord = medicalRecord._id;
              await updatedPatient.save();

              // Créer le fichier patient initial
              const patientFile = new PatientFile({
                  medicalRecord: medicalRecord._id,
                  creator: updatedPatient.assignedDoctor || req.user._id,
                  type: "PatientInformation",
                  details: {
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
                      },
                  },
              });
              await patientFile.save();
          }
      }

      res.status(200).json(updatedPatient);
  } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// Ajoutez cette nouvelle route à la fin de votre fichier emergencyPatient.js

/**
 * @route GET /api/emergency-patients/:id/medical-record
 * @description Récupère le dossier médical d'un patient d'urgence
 * @access Protégé (authentification requise)
 */
router.get('/:id/medical-record', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID patient invalide" });
  }

  try {
    // Vérifier que le patient existe
    const patient = await EmergencyPatient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Solution 1: Requête séparée sans populate problématique
    const medicalRecord = await MedicalRecord.findOne({ patientId: id })
      .populate('patientId', 'firstName lastName dateOfBirth')
      .lean(); // Convertit en objet JS simple

    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé pour ce patient" });
    }

    // Récupérer le créateur séparément si nécessaire
    if (medicalRecord.creator) {
      medicalRecord.creator = await User.findById(medicalRecord.creator)
        .select('username role specialization')
        .lean();
    }

    // Récupérer les fichiers avec leur créateur
    const patientFiles = await PatientFile.find({ medicalRecord: medicalRecord._id })
      .sort({ dateRecorded: -1 })
      .lean();

    // Récupérer les créateurs des fichiers en une seule requête
    const creatorIds = patientFiles.map(f => f.creator).filter(Boolean);
    const creators = await User.find({ _id: { $in: creatorIds } })
      .select('username role')
      .lean();

    const creatorsMap = creators.reduce((acc, creator) => {
      acc[creator._id] = creator;
      return acc;
    }, {});

    // Combiner les résultats
    const result = {
      ...medicalRecord,
      patientFiles: patientFiles.map(file => ({
        ...file,
        creator: file.creator ? creatorsMap[file.creator] : null
      }))
    };

    res.status(200).json(result);

  } catch (error) {
    console.error("Erreur récupération dossier médical:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }
  try {
    const deletedPatient = await EmergencyPatient.findByIdAndDelete(id);
    if (!deletedPatient) return res.status(404).json({ message: "Patient non trouvé" });

    if (deletedPatient.assignedDoctor) {
      await User.findByIdAndUpdate(deletedPatient.assignedDoctor, { isAvailable: true });
      console.log(`Médecin ${deletedPatient.assignedDoctor} rendu disponible`);
    }

    res.status(200).json({ message: "Patient supprimé", deletedId: id });
  } catch (error) {
    console.error("Erreur suppression patient:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

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
    console.error("Erreur récupération patients médecin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.get('/stats/total', async (req, res) => {
  try {
    const totalPatients = await EmergencyPatient.countDocuments();
    res.status(200).json({ total: totalPatients });
  } catch (error) {
    console.error("Erreur récupération nombre total de patients:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * @route GET /api/emergency-patients/stats/today
 * @description Récupère le nombre de patients d'urgence enregistrés aujourd'hui
 * @access Public ou Protégé selon vos besoins
 */
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const patientsToday = await EmergencyPatient.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.status(200).json({ today: patientsToday });
  } catch (error) {
    console.error("Erreur récupération nombre de patients aujourd'hui:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
export const getEmergencyLevelStats = async (req, res) => {
  try {
      const stats = await EmergencyPatient.getEmergencyLevelStats();
      res.json(stats);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Optionnel: pour les tendances temporelles
export const getEmergencyTrends = async (req, res) => {
  try {
      const { period = 'day' } = req.query;
      const trends = await EmergencyPatient.getEmergencyTrends(period);
      res.json(trends);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
router.get('/stats/levels', getEmergencyLevelStats);
router.get('/stats/trends', getEmergencyTrends);
export default router;