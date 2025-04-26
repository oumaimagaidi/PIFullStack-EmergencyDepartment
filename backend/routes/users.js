import express from "express";
import { User } from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import SharedMedicalRecord from "../models/SharedMedicalRecord.js";
import AuditLog from "../models/AuditLog.js";
import MedicalRecord from "../models/MedicalRecord.js"; // <-- Import crucial ici


const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();

// Get all doctors (accessible to doctors and admins)
router.get("/doctor/doctors", authenticateToken, async (req, res) => {
  try {
    if (!["Doctor", "Administrator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const doctors = await User.find({ role: "Doctor" }).select("_id username");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Partager un dossier médical avec un autre médecin
router.post('/medical-records/:recordId/share', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Doctor') {
      return res.status(403).json({ message: "Accès réservé aux médecins" });
    }

    const { recordId } = req.params;
    const { recipientId, note } = req.body;

    // Validation de l'ID du destinataire
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "ID médecin destinataire invalide" });
    }

    // Récupération du médecin destinataire
    const recipientDoctor = await User.findOne({
      _id: recipientId,
      role: 'Doctor'
    });

    if (!recipientDoctor) {
      return res.status(404).json({ message: "Médecin destinataire introuvable" });
    }

    // Vérification de l'auto-partage (corrigé)
    if (recipientId === req.user.id) { // <-- Correction ici
      return res.status(400).json({ message: "Impossible de partager avec vous-même" });
    }

    // Vérification du dossier médical
    const medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical introuvable" });
    }

    // Création du partage
    const newShare = new SharedMedicalRecord({
      medicalRecordId: recordId,
      sharerId: req.user.id, // Utilisation de .id
      recipientId: recipientId,
      note: note || "Partage de dossier médical"
    });

    await newShare.save();

    // Journalisation
    await AuditLog.create({
      action: 'SHARE_MEDICAL_RECORD',
      userId: req.user.id, // Utilisation de .id
      details: `Partage du dossier ${recordId} avec le Dr. ${recipientDoctor.username}`
    });

    res.status(201).json({
      message: "Dossier partagé avec succès",
      shareDetails: newShare
    });

  } catch (error) {
    console.error("Erreur lors du partage du dossier:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Récupérer les dossiers partagés avec le médecin connecté
router.get('/medical-records/shared', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un médecin
    if (req.user.role !== 'Doctor') {
      return res.status(403).json({ message: "Accès réservé aux médecins" });
    }

    const sharedRecords = await SharedMedicalRecord.find({ recipientId: req.user._id })
      .populate({
        path: 'medicalRecordId',
        populate: [
          {
            path: 'patientId',
            model: 'EmergencyPatient',
            select: 'firstName lastName dateOfBirth gender'
          },
          {
            path: 'creator',
            model: 'User',
            select: 'username specialization'
          }
        ]
      })
      .populate('sharerId', 'username role')
      .sort({ sharedAt: -1 });

    // Formater la réponse
    const formattedRecords = sharedRecords.map(record => ({
      _id: record._id,
      sharedAt: record.sharedAt,
      note: record.note,
      sharer: record.sharerId,
      medicalRecord: {
        _id: record.medicalRecordId._id,
        patient: record.medicalRecordId.patientId,
        creator: record.medicalRecordId.creator,
        bloodType: record.medicalRecordId.bloodType,
        lastUpdated: record.medicalRecordId.lastUpdated
      }
    }));

    res.status(200).json(formattedRecords);

  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers partagés:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
function formatFileDetails(file) {
  const baseDetails = {
    id: file._id,
    type: file.type,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt
  };

  switch(file.type) {
    case 'Triage':
      return {
        ...baseDetails,
        priorityLevel: file.details.priorityLevel,
        chiefComplaint: file.details.chiefComplaint
      };
    case 'Diagnostic':
      return {
        ...baseDetails,
        diagnosis: file.details.diagnosis,
        tests: file.details.diagnosticTests
      };
    case 'Treatment':
      return {
        ...baseDetails,
        procedures: file.details.procedures
      };
    case 'VitalSigns':
      return {
        ...baseDetails,
        vitalSigns: file.details.vitalSigns
      };
    case 'Prescription':
      return {
        ...baseDetails,
        medications: file.details.medications
      };
    default:
      return baseDetails;
  }
}
// Récupérer les dossiers partagés avec le médecin connecté
router.get('/medical-records/shared-with-me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Doctor') {
      return res.status(403).json({ message: "Accès réservé aux médecins" });
    }

    const sharedRecords = await SharedMedicalRecord.find({ recipientId: req.user.id })
      .populate({
        path: 'medicalRecordId',
        populate: [
          {
            path: 'patientId',
            model: 'EmergencyPatient',
            select: 'firstName lastName dateOfBirth gender'
          },
          {
            path: 'creator',
            model: 'User',
            select: 'username specialization'
          },
          {
            path: 'patientFiles',
            model: 'PatientFile',
            options: { 
              sort: { dateRecorded: -1 },
              match: { medicalRecord: { $exists: true } } // Filtre supplémentaire
            }
          }
        ]
      })
      .populate('sharerId', 'username role')
      .sort({ sharedAt: -1 });

    // Ajouter une validation supplémentaire
    const formattedRecords = sharedRecords.map(record => {
      if (!record.medicalRecordId?.patientFiles) {
        console.warn(`Dossier ${record._id} a une structure invalide`);
        return null;
      }

      return {
        // ... autres champs ...,
        medicalRecord: {
          // ... autres champs ...,
          files: record.medicalRecordId.patientFiles
            .filter(file => file) // Filtrer les fichiers null
            .map(file => ({
              id: file._id,
              type: file.type,
              dateRecorded: file.dateRecorded,
              notes: file.notes,
              details: formatFileDetails(file)
            }))
        }
      };
    }).filter(record => record !== null); // Filtrer les entrées invalides

    res.status(200).json(formattedRecords);

  } catch (error) {
    console.error("Erreur de récupération :", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ajouter cette méthode de formatage

router.get("/doctors", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const doctors = await User.find({ role: "Doctor" }); // Find users with role "Doctor"
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
// Obtenir tous les utilisateurs (admin uniquement)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Obtenir un utilisateur par ID
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.id); // Ensure the id is cast to ObjectId
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// Mettre à jour un utilisateur
router.put("/:id", authenticateToken, async (req, res) => {
  try {
  

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Supprimer un utilisateur (admin uniquement)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Route de validation d'utilisateur (admin uniquement)
router.post("/validate-user", authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Valider l'utilisateur
    user.isValidated = true;
    await user.save();

    res.status(200).json({ message: "Utilisateur validé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
router.get("/patients/count", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const patientCount = await User.countDocuments({ role: "Patient" });
    res.status(200).json({ count: patientCount });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
router.get("/patients", authenticateToken, async (req, res) => {
  try {
    // Ensure the user is an Administrator, Doctor, or Nurse
    if (!["Administrator", "Doctor", "Nurse"].includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Fetch patients from the database
    const patients = await User.find({ role: "Patient" }).exec();

    // Check if patients were found
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: "Aucun patient trouvé" });
    }

    // Return the list of patients
    res.status(200).json(patients);
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error); // Log the error
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Delete a patient (admin only)
router.delete("/patients/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== "Patient") {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du patient:", error); // Log the error
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Update a patient (admin only)
router.put("/patients/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== "Patient") {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const updatedPatient = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du patient:", error); // Log the error
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
router.put("/:id/availability", authenticateToken, async (req, res) => {
    const targetUserId = req.params.id;
    const requesterUserId = req.user.id; // ID de celui qui fait la requête
    const requesterRole = req.user.role; // Rôle de celui qui fait la requête
    const { isAvailable } = req.body; // Valeur attendue : true ou false

    // 1. Validation de l'ID cible
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "ID utilisateur cible invalide." });
    }

    // 2. Vérification d'autorisation : Admin OU le médecin lui-même
    if (requesterRole !== "Administrator" && requesterUserId !== targetUserId) {
        console.log(`Accès refusé pour ${requesterUserId} (rôle ${requesterRole}) tentant de modifier ${targetUserId}`);
        return res.status(403).json({ message: "Accès refusé. Vous ne pouvez modifier que votre propre disponibilité ou être administrateur." });
    }

    // 3. Validation de la valeur 'isAvailable' reçue
    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: "La valeur fournie pour 'isAvailable' est invalide (doit être true ou false)." });
    }

    try {
        // 4. Trouver l'utilisateur cible
        const userToUpdate = await User.findById(targetUserId);

        if (!userToUpdate) {
             return res.status(404).json({ message: "L'utilisateur cible n'a pas été trouvé." });
        }

        // 5. Vérifier si l'utilisateur cible est bien un médecin
        if (userToUpdate.role !== 'Doctor') {
           return res.status(400).json({ message: "La disponibilité ne peut être modifiée que pour un utilisateur ayant le rôle 'Doctor'." });
        }

        // 6. Mettre à jour la disponibilité et sauvegarder
        userToUpdate.isAvailable = isAvailable;
        await userToUpdate.save();
        console.log(`Disponibilité de ${userToUpdate.username} (ID: ${targetUserId}) mise à jour à ${isAvailable} par ${requesterUserId}`);

        // 7. Renvoyer une réponse de succès
        res.status(200).json({
            message: `Disponibilité de ${userToUpdate.username} mise à jour à ${isAvailable ? 'Disponible' : 'Occupé'}.`,
            user: { // Renvoyer seulement les infos nécessaires
                _id: userToUpdate._id,
                username: userToUpdate.username,
                isAvailable: userToUpdate.isAvailable
            }
        });

    } catch (error) {
        console.error(`Erreur PUT /${targetUserId}/availability:`, error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la disponibilité.", error: error.message });
    }
});
router.get("/nurses", authenticateToken, async (req, res) => {
  try {
    // Find users with the role "Nurse"
    const nurses = await User.find({ role: "Nurse" });
    res.status(200).json(nurses);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Nouvelle route pour les statistiques des utilisateurs
router.get("/stats", authenticateToken, async (req, res) => {
  try {
      if (req.user.role !== "Administrator") {
          return res.status(403).json({ message: "Accès refusé" });
      }

      const [patients, doctors, nurses, admins, emergencyPatients] = await Promise.all([
          User.countDocuments({ role: "Patient" }),
          User.countDocuments({ role: "Doctor" }),
          User.countDocuments({ role: "Nurse" }),
          User.countDocuments({ role: "Administrator" }),
          mongoose.model('EmergencyPatient').countDocuments()
      ]);

      const totalUsers = patients + doctors + nurses + admins;
      
      const stats = [
          { name: "Patients", count: patients, percentage: (patients / totalUsers * 100).toFixed(2) },
          { name: "Doctors", count: doctors, percentage: (doctors / totalUsers * 100).toFixed(2) },
          { name: "Nurses", count: nurses, percentage: (nurses / totalUsers * 100).toFixed(2) },
          { name: "Admins", count: admins, percentage: (admins / totalUsers * 100).toFixed(2) },
          { name: "Emergency", count: emergencyPatients, percentage: (emergencyPatients / (totalUsers + emergencyPatients) * 100).toFixed(2) }
      ];

      res.status(200).json(stats);
  } catch (error) {
      console.error("Erreur récupération stats utilisateurs:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// Ajoutez cette route dans votre fichier de routes (users.js)
// Dans users.js (backend)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires");

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      // Ajoutez d'autres champs si nécessaire
    });
    
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
export default router;
