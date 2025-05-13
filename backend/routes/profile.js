// routes/profile.js
import express from 'express';
import { User } from '../models/User.js'; // User model already includes donationCount and unlockedBadges
import { authenticateToken } from '../middleware/authMiddleware.js';
import cors from "cors";
import dotenv from "dotenv";

const router = express.Router();
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();

// GET current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  console.log("📩 Requête GET /api/profile reçue pour l'utilisateur ID:", req.user.id);
  try {
    const user = await User.findById(req.user.id)
                           .select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires') // Exclude sensitive fields
                           .lean(); // Use .lean() for plain JS object, good for response
    
    if (!user) {
      console.log(`Utilisateur non trouvé pour ID: ${req.user.id}`);
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    // Construct the base personal profile data
    let profileData = {
      personal: {
        _id: user._id, // Good to include user's own ID
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage, // This path should be relative to your uploads folder on the frontend or a full URL from backend
        donationCount: user.donationCount || 0,         // <-- ADDED
        unlockedBadges: user.unlockedBadges || [],      // <-- ADDED
        // Add other base UserSchema fields if needed in 'personal'
      },
      // Initialize other potential sections to prevent frontend errors if they don't exist for a role
      contact: {}, 
      emergencyContacts: {},
      settings: {},
      medical: {},
      professional: {},
      certifications: {},
      appointments: {}
    };

    // Add role-specific data. Mongoose discriminators mean role-specific fields are directly on the 'user' object.
    switch (user.role) {
      case 'Patient':
        // For 'Patient', role-specific data is often in a 'medical' section in your frontend
        // The 'User' model for 'Patient' discriminator already has these fields.
        profileData.medical = {
          name: user.name, // Patient's full name if different from username
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          emergencyContact: user.emergencyContact, // This might be a string or an object {name, phone, relationship}
          bloodType: user.bloodType,
          allergies: user.allergies || []
        };
        // Populate other patient-specific sections if your frontend expects them
        // e.g., profileData.appointments = await fetchAppointments(user._id);
        break;

      case 'Doctor':
        profileData.professional = {
          badgeNumber: user.badgeNumber,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          isAvailable: typeof user.isAvailable === 'boolean' ? user.isAvailable : true // Default to true if not set
        };
        // e.g., profileData.certifications = await fetchCertifications(user._id);
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

    console.log("Données de profil envoyées:", JSON.stringify(profileData, null, 2));
    res.status(200).json(profileData);
  } catch (error) {
    console.error("Erreur serveur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// PUT update current user's profile
router.put('/profile', authenticateToken, async (req, res) => {
  console.log("📩 Requête PUT /api/profile reçue pour l'utilisateur ID:", req.user.id);
  console.log("Données reçues pour la mise à jour:", JSON.stringify(req.body, null, 2));

  try {
    // Fetch user document (not .lean(), as we need to .save() it)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }

    const { personal, medical, professional, contact, emergencyContacts, settings, certifications, appointments } = req.body;

    // Update common personal fields from 'personal' object
    if (personal) {
      if (typeof personal.username !== 'undefined') user.username = personal.username;
      // Email change requires careful consideration (verification, uniqueness)
      // For now, let's assume email is not changed here or handled separately
      // if (typeof personal.email !== 'undefined' && personal.email !== user.email) {
      //   // Add logic for email change verification if needed
      //   user.email = personal.email;
      // }
      if (typeof personal.phoneNumber !== 'undefined') user.phoneNumber = personal.phoneNumber;
      if (typeof personal.profileImage !== 'undefined') user.profileImage = personal.profileImage; // Path to new image
      // donationCount and unlockedBadges are managed by the system, not directly by user profile edit.
    }

    // Update role-specific fields
    switch (user.role) {
      case 'Patient':
        if (medical) {
          if (typeof medical.name !== 'undefined') user.name = medical.name;
          if (typeof medical.dateOfBirth !== 'undefined') user.dateOfBirth = medical.dateOfBirth;
          if (typeof medical.gender !== 'undefined') user.gender = medical.gender;
          if (typeof medical.address !== 'undefined') user.address = medical.address;
          if (typeof medical.emergencyContact !== 'undefined') user.emergencyContact = medical.emergencyContact;
          if (typeof medical.bloodType !== 'undefined') user.bloodType = medical.bloodType;
          if (typeof medical.allergies !== 'undefined') user.allergies = medical.allergies;
        }
        // Update other patient-specific sections if they are part of the User model or handled here
        // For example, if `contact` and `emergencyContacts` are direct fields or simple objects on User model:
        if (contact) {
          // Example: user.contactInfo = { ...user.contactInfo, ...contact };
          // Or if they are direct fields: user.street = contact.street || user.street;
        }
        if (emergencyContacts) {
           // Example: user.emergencyContactDetails = { ...user.emergencyContactDetails, ...emergencyContacts};
        }
        break;
      case 'Doctor':
        if (professional) {
          if (typeof professional.badgeNumber !== 'undefined') user.badgeNumber = professional.badgeNumber;
          if (typeof professional.specialization !== 'undefined') user.specialization = professional.specialization;
          if (typeof professional.licenseNumber !== 'undefined') user.licenseNumber = professional.licenseNumber;
          if (typeof professional.isAvailable !== 'undefined') user.isAvailable = professional.isAvailable;
        }
        if (certifications) { /* update certifications */ }
        break;
      case 'Nurse':
        if (professional) {
          if (typeof professional.badgeNumber !== 'undefined') user.badgeNumber = professional.badgeNumber;
          if (typeof professional.shift !== 'undefined') user.shift = professional.shift;
          if (typeof professional.licenseNumber !== 'undefined') user.licenseNumber = professional.licenseNumber;
        }
        break;
      case 'Administrator':
        if (professional) {
          if (typeof professional.badgeNumber !== 'undefined') user.badgeNumber = professional.badgeNumber;
        }
        break;
    }

    // Update general settings if provided
    if (settings) {
        // Example: if (typeof settings.language !== 'undefined') user.settings.language = settings.language;
        // This assumes 'user.settings' is an object. Adjust based on your User schema.
    }


    const updatedUser = await user.save();
    console.log("Profil mis à jour avec succès, utilisateur:", updatedUser.username);
    
    // To ensure the response has the exact same structure as GET /profile,
    // we re-fetch and re-format. This is slightly less efficient but guarantees consistency.
    // Alternatively, manually construct the response object like in the GET route.
    // For now, let's redirect to the GET route to re-fetch.
    // However, redirecting a PUT request to GET is not standard. Better to return the updated data.

    // Re-fetch the user to get the lean object with populated fields if necessary,
    // and structure it exactly like the GET /profile response.
    const userForResponse = await User.findById(updatedUser._id)
                                   .select('-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires')
                                   .lean();

    let responseProfileData = {
      personal: {
        _id: userForResponse._id,
        username: userForResponse.username,
        email: userForResponse.email,
        phoneNumber: userForResponse.phoneNumber,
        role: userForResponse.role,
        profileImage: userForResponse.profileImage,
        donationCount: userForResponse.donationCount || 0,
        unlockedBadges: userForResponse.unlockedBadges || [],
      },
      contact: {}, medical: {}, professional: {}, emergencyContacts: {}, settings: {}, certifications: {}, appointments: {} // Initialize all
    };
     switch (userForResponse.role) {
      case 'Patient':
        responseProfileData.medical = {
          name: userForResponse.name, dateOfBirth: userForResponse.dateOfBirth, gender: userForResponse.gender,
          address: userForResponse.address, emergencyContact: userForResponse.emergencyContact,
          bloodType: userForResponse.bloodType, allergies: userForResponse.allergies || []
        };
        // Populate contact, emergencyContacts, settings, appointments if they are part of patient data structure
        break;
      case 'Doctor':
        responseProfileData.professional = {
          badgeNumber: userForResponse.badgeNumber, specialization: userForResponse.specialization,
          licenseNumber: userForResponse.licenseNumber, isAvailable: userForResponse.isAvailable
        };
        // Populate certifications, appointments
        break;
      case 'Nurse':
        responseProfileData.professional = {
          badgeNumber: userForResponse.badgeNumber, shift: userForResponse.shift,
          licenseNumber: userForResponse.licenseNumber
        };
        break;
      case 'Administrator':
        responseProfileData.professional = { badgeNumber: userForResponse.badgeNumber };
        break;
    }

    res.status(200).json(responseProfileData);

  } catch (error) {
    console.error("Erreur serveur lors de la mise à jour du profil:", error);
    if (error.name === 'ValidationError') {
        console.error("Mongoose Validation Errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router;