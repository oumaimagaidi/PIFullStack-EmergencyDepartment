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

router.post('/', async (req, res) => {
  try {
    const patient = new EmergencyPatient({ ...req.body });
    let savedPatient = await patient.save();

    const availableDoctor = await findAvailableDoctor();

    if (availableDoctor) {
      savedPatient.assignedDoctor = availableDoctor._id;
      savedPatient = await savedPatient.save();

      try {
        await User.findByIdAndUpdate(availableDoctor._id, { isAvailable: false });
        console.log(`Statut du médecin ${availableDoctor.username} mis à jour à 'Occupé'.`);
      } catch (doctorUpdateError) {
        console.error(`Échec mise à jour disponibilité médecin ${availableDoctor._id}:`, doctorUpdateError);
      }
    } else {
      console.warn(`Aucun médecin disponible pour ${savedPatient.firstName} ${savedPatient.lastName}.`);
    }

    const responsePatient = await EmergencyPatient.findById(savedPatient._id)
      .populate('assignedDoctor', 'username specialization email profileImage');
    res.status(201).json(responsePatient || savedPatient);
  } catch (error) {
    console.error("Erreur création patient:", error);
    res.status(500).json({ message: 'Erreur Serveur Interne' });
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

router.put('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Mise à jour statut patient ${id} à "${status}"`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  const allowedStatuses = ['Demande Enregistrée', 'En Cours d\'Examen', 'Médecin Assigné', 'Médecin En Route', 'Traité', 'Annulé'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Statut invalide. Valeurs autorisées: ${allowedStatuses.join(', ')}` });
  }

  try {
    const updatedPatient = await EmergencyPatient.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('assignedDoctor', 'username specialization email');

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    console.log(`Statut patient ${updatedPatient._id} mis à jour à "${status}"`);

    // Création automatique du MedicalRecord et PatientFile
    if (['Médecin En Route', 'Traité'].includes(status)) {
      console.log(`Statut "${status}" détecté, vérification MedicalRecord...`);

      let medicalRecord = await MedicalRecord.findOne({ patientId: updatedPatient._id });

      if (!medicalRecord) {
        console.log(`Création MedicalRecord pour patient ${updatedPatient._id}`);
        medicalRecord = new MedicalRecord({
          patientId: updatedPatient._id,
          creator: updatedPatient.assignedDoctor || req.user._id,
          emergencyContact: { phone: updatedPatient.emergencyContact },
          knownAllergies: updatedPatient.allergies ? updatedPatient.allergies.split(',') : [],
        });
        await medicalRecord.save();

        updatedPatient.medicalRecord = medicalRecord._id;
        await updatedPatient.save();

        console.log(`MedicalRecord créé avec ID: ${medicalRecord._id}`);

        console.log(`Création PatientFile pour MedicalRecord ${medicalRecord._id}`);
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

        console.log(`PatientFile créé avec ID: ${patientFile._id}`);
      } else {
        console.log(`MedicalRecord déjà existant pour patient ${updatedPatient._id}: ${medicalRecord._id}`);
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

export default router;