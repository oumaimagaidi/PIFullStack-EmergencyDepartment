// In your routes/profile.js
import express from 'express';
import { User, Patient, Doctor, Nurse, Administrator } from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import cors from "cors";
import dotenv from "dotenv";

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();

router.get('/profile', authenticateToken, async (req, res) => {
  console.log("📩 Requête reçue :", req.body);
  try {
    // Get complete user document including role-specific fields
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }
    const profileImageUrl = user.profileImage ? `http://localhost:8089/${user.profileImage}` : null;

    // Format data based on user role
    let profileData = {
      personal: {
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage
      }
    };

    // Add role-specific data
    switch (user.role) {
      case 'Patient':
        profileData.medical = {
          name: user.name,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          emergencyContact: user.emergencyContact,
          bloodType: user.bloodType,
          allergies: user.allergies || []
        };
        break;

      case 'Doctor':
        profileData.professional = {
          badgeNumber: user.badgeNumber,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber
        };
        break;

      case 'Nurse':
        profileData.professional = {
          badgeNumber: user.badgeNumber,
          shift: user.shift,
          licenseNumber: user.licenseNumber
        };
        break;

      case 'Administrator':
        profileData.professional = {
          badgeNumber: user.badgeNumber
        };
        break;
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Update profile endpoint
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { personal, medical, professional } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    // Update common fields
    if (personal) {
      user.username = personal.username || user.username;
      user.email = personal.email || user.email;
      user.phoneNumber = personal.phoneNumber || user.phoneNumber;
    }

    // Update role-specific fields
    switch (user.role) {
      case 'Patient':
        if (medical) {
          user.name = medical.name || user.name;
          user.dateOfBirth = medical.dateOfBirth || user.dateOfBirth;
          user.gender = medical.gender || user.gender;
          user.address = medical.address || user.address;
          user.emergencyContact = medical.emergencyContact || user.emergencyContact;
          user.bloodType = medical.bloodType || user.bloodType;
          user.allergies = medical.allergies || user.allergies;
        }
        break;

      case 'Doctor':
      case 'Nurse':
        if (professional) {
          user.badgeNumber = professional.badgeNumber || user.badgeNumber;
          user.licenseNumber = professional.licenseNumber || user.licenseNumber;
          if (user.role === 'Doctor') {
            user.specialization = professional.specialization || user.specialization;
          } else {
            user.shift = professional.shift || user.shift;
          }
        }
        break;

      case 'Administrator':
        if (professional) {
          user.badgeNumber = professional.badgeNumber || user.badgeNumber;
        }
        break;
    }

    await user.save();
    
    // Return updated profile in same format as GET
    res.redirect(303, '/api/profile');
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router;
