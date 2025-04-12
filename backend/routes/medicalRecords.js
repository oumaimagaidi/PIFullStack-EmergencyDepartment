import express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "../middleware/authMiddleware.js";
import MedicalRecord from "../models/MedicalRecord.js";
import EmergencyPatient from "../models/EmergencyPatient.js";
import PatientFile from "../models/PatientFile.js";
import { User } from "../models/User.js"; // <-- Ajoutez cette ligne

const router = express.Router();

// Créer un MedicalRecord
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "ID patient invalide" });
    }

    const patient = await EmergencyPatient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Vérifier si un MedicalRecord existe déjà
    const existingRecord = await MedicalRecord.findOne({ patientId });
    if (existingRecord) {
      return res.status(400).json({ message: "Un dossier médical existe déjà pour ce patient" });
    }

    const medicalRecord = new MedicalRecord({
      patientId,
      creator: req.user._id,
      emergencyContact: patient.emergencyContact ? { phone: patient.emergencyContact } : undefined,
      knownAllergies: patient.allergies ? patient.allergies.split(',') : [],
      bloodType: patient.bloodType,
    });

    await medicalRecord.save();

    // Mettre à jour le patient avec la référence au MedicalRecord
    patient.medicalRecord = medicalRecord._id;
    await patient.save();

    res.status(201).json(medicalRecord);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Récupérer tous les MedicalRecords
router.get("/", authenticateToken, async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patientId', 'firstName lastName dateOfBirth')
      .populate('creator', 'username specialization');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // 1. Récupérer le dossier médical de base
    const record = await MedicalRecord.findById(id)
      .populate('patientId', 'firstName lastName dateOfBirth gender phoneNumber')
      .populate('creator', 'username role specialization')
      .lean();

    if (!record) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    // 2. Récupérer les fichiers patients séparément avec les créateurs
    const patientFiles = await PatientFile.aggregate([
      { $match: { medicalRecord: new mongoose.Types.ObjectId(id) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creatorInfo"
        }
      },
      { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          type: 1,
          notes: 1,
          details: 1,
          createdAt: 1,
          updatedAt: 1,
          creator: {
            username: "$creatorInfo.username",
            role: "$creatorInfo.role"
          }
        }
      }
    ]);

    // 3. Combiner les résultats
    const result = {
      ...record,
      patientFiles
    };

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching medical record:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Mettre à jour un MedicalRecord
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Supprimer un MedicalRecord (avec ses PatientFiles associés)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // Supprimer d'abord les PatientFiles associés
    await PatientFile.deleteMany({ medicalRecord: id });

    // Puis supprimer le MedicalRecord
    const deletedRecord = await MedicalRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    // Mettre à jour le patient en retirant la référence
    await EmergencyPatient.updateOne(
      { medicalRecord: id },
      { $unset: { medicalRecord: "" } }
    );

    res.status(200).json({ message: "Dossier médical et fichiers associés supprimés" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
/**
 * @route POST /api/medical-records/:recordId/files
 * @description Ajoute un fichier patient à un dossier médical
 * @body {type, notes, details}
 * @access Protégé (authentification requise)
 */
router.post('/:recordId/files', authenticateToken, async (req, res) => {
  const { recordId } = req.params;
  const { type, notes, details } = req.body;

  try {
    // Vérifier que le dossier médical existe
    const medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    // Créer le nouveau fichier patient
    const newFile = new PatientFile({
      medicalRecord: recordId,
      creator: req.user._id, // L'utilisateur authentifié
      type,
      notes,
      details,
      dateRecorded: new Date()
    });

    // Sauvegarder le fichier
    await newFile.save();

    // Mettre à jour la date de dernière modification du dossier médical
    medicalRecord.lastUpdated = new Date();
    await medicalRecord.save();

    res.status(201).json(newFile);

  } catch (error) {
    console.error("Erreur création fichier patient:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
});
// Nouvelle route pour accéder au dossier médical par code
router.get('/by-access-code/:accessCode', async (req, res) => {
  try {
      const { accessCode } = req.params;
      
      // 1. Trouver le dossier médical de base
      const medicalRecord = await MedicalRecord.findOne({ accessCode })
          .populate('patientId', 'firstName lastName dateOfBirth gender phoneNumber email')
          .populate('creator', 'username role specialization')
          .lean();

      if (!medicalRecord) {
          return res.status(404).json({ message: "Dossier médical non trouvé" });
      }

      // 2. Récupérer les fichiers patients séparément
      const patientFiles = await PatientFile.find({ 
          medicalRecord: medicalRecord._id 
      })
      .sort({ createdAt: -1 })
      .lean();

      // 3. Récupérer les informations des créateurs des fichiers
      const creatorIds = patientFiles.map(file => file.creator).filter(Boolean);
      const creators = creatorIds.length > 0 ? await User.find({ 
          _id: { $in: creatorIds } 
      }).select('username role').lean() : [];

      // 4. Créer un mapping des créateurs
      const creatorMap = creators.reduce((map, creator) => {
          map[creator._id.toString()] = creator;
          return map;
      }, {});

      // 5. Combiner les résultats
      const result = {
          ...medicalRecord,
          patientFiles: patientFiles.map(file => ({
              ...file,
              creator: file.creator ? creatorMap[file.creator.toString()] : null
          }))
      };

      res.status(200).json(result);
  } catch (error) {
      console.error("Erreur récupération dossier médical:", error);
      res.status(500).json({ 
          message: "Erreur serveur", 
          error: error.message 
      });
  }
});
router.get('/:recordId/files', authenticateToken, async (req, res) => {
  const { recordId } = req.params;

  try {
    // Vérifier que le dossier médical existe
    const medicalRecord = await MedicalRecord.findById(recordId);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Dossier médical non trouvé" });
    }

    // Récupérer les fichiers sans populate
    const patientFiles = await PatientFile.find({ medicalRecord: recordId })
      .sort({ dateRecorded: -1 })
      .lean(); // Convertit en objets JavaScript simples

    // Récupérer tous les créateurs en une seule requête
    const creatorIds = patientFiles.map(file => file.creator).filter(id => id);
    const creators = await User.find({ _id: { $in: creatorIds } })
      .select('username role')
      .lean();

    // Créer un map pour un accès rapide
    const creatorMap = creators.reduce((map, creator) => {
      map[creator._id] = creator;
      return map;
    }, {});

    // Combiner les fichiers avec leurs créateurs
    const filesWithCreators = patientFiles.map(file => ({
      ...file,
      creator: file.creator ? creatorMap[file.creator.toString()] : null
    }));

    res.status(200).json(filesWithCreators);

  } catch (error) {
    console.error("Erreur récupération fichiers patients:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
});


export default router;