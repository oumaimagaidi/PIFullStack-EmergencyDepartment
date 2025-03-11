import express from "express";
import { User } from "../models/User.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();


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
    if (req.user.id !== req.params.id && req.user.role !== "Administrator") {
      return res.status(403).json({ message: "Accès refusé" });
    }

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
export default router;
