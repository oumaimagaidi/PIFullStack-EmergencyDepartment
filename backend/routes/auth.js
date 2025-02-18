import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv";
import crypto from "crypto"; // Utilisez cette syntaxe pour les modules ES
import nodemailer from "nodemailer";
import { generateOTP, saveOTPToUser,verifyOTP } from "../services/otpService.js";
import { sendOTP } from "../services/emailService.js";
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware CORS pour assurer que toutes les routes acceptent les requêtes frontend
import cors from "cors";

const router = express.Router();

router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    if (!user.isValidated)
      return res.status(400).json({ message: "Votre compte est en attente de validation par un administrateur" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Connexion réussie", token, user });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route de login avec Google
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, username: name, profilePicture: picture, isValidated: true });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Connexion réussie avec Google", token: jwtToken, user });
  } catch (error) {
    console.error("Erreur Google Login:", error);
    res.status(500).json({ message: "Erreur lors de l'authentification Google", error: error.message });
  }
});




router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phoneNumber, role, ...roleSpecificData } = req.body;

    console.log("Données reçues :", req.body); // Log pour vérifier les données reçues

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email déjà utilisé :", email);
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Si le rôle est un rôle restreint (Doctor, Nurse, Admin), l'utilisateur doit être en attente
    const isValidated = role === "Patient"; // Si rôle Patient, utilisateur est validé

    // Créer un nouvel utilisateur
    const newUserData = { username, email, password: hashedPassword, phoneNumber, role, isValidated };

    // Ajouter les champs spécifiques au rôle
    switch (role) {
      case "Patient":
        const { name, dateOfBirth, gender, address, emergencyContact, bloodType, allergies } = roleSpecificData;

        // Vérifier que tous les champs obligatoires sont fournis
        if (!name || !dateOfBirth || !gender || !address || !emergencyContact || !bloodType) {
          console.log("Champs obligatoires manquants pour un patient");
          return res.status(400).json({ message: "Tous les champs obligatoires pour un patient doivent être remplis" });
        }

        // Ajouter les champs spécifiques au patient
        newUserData.name = name;
        newUserData.dateOfBirth = dateOfBirth;
        newUserData.gender = gender;
        newUserData.address = address;
        newUserData.emergencyContact = emergencyContact;
        newUserData.bloodType = bloodType;
        newUserData.allergies = allergies || []; // Les allergies sont optionnelles
        break;

      case "Doctor":
        const { badgeNumber: docBadgeNumber, specialization, licenseNumber: docLicenseNumber } = roleSpecificData;

        // Vérifier que tous les champs obligatoires sont fournis
        if (!docBadgeNumber || !specialization || !docLicenseNumber) {
          console.log("Champs obligatoires manquants pour un médecin");
          return res.status(400).json({ message: "Tous les champs obligatoires pour un médecin doivent être remplis" });
        }

        // Ajouter les champs spécifiques au médecin
        newUserData.badgeNumber = docBadgeNumber;
        newUserData.specialization = specialization;
        newUserData.licenseNumber = docLicenseNumber;
        break;

      case "Nurse":
        const { badgeNumber: nurseBadgeNumber, shift, licenseNumber: nurseLicenseNumber } = roleSpecificData;

        // Vérifier que tous les champs obligatoires sont fournis
        if (!nurseBadgeNumber || !shift || !nurseLicenseNumber) {
          console.log("Champs obligatoires manquants pour une infirmière");
          return res.status(400).json({ message: "Tous les champs obligatoires pour une infirmière doivent être remplis" });
        }

        // Ajouter les champs spécifiques à l'infirmière
        newUserData.badgeNumber = nurseBadgeNumber;
        newUserData.shift = shift;
        newUserData.licenseNumber = nurseLicenseNumber;
        break;

      case "Administrator":
        const { badgeNumber: adminBadgeNumber } = roleSpecificData;

        // Vérifier que tous les champs obligatoires sont fournis
        if (!adminBadgeNumber) {
          console.log("Champs obligatoires manquants pour un administrateur");
          return res.status(400).json({ message: "Le numéro de badge est obligatoire pour un administrateur" });
        }

        // Ajouter les champs spécifiques à l'administrateur
        newUserData.badgeNumber = adminBadgeNumber;
        break;

      default:
        console.log("Rôle invalide :", role);
        return res.status(400).json({ message: "Rôle invalide" });
    }

    // Créer un nouvel utilisateur
    const newUser = new User(newUserData);
    await newUser.save();
    console.log("Utilisateur créé avec succès :", newUser);

    // Générer et envoyer l'OTP
    const { otp, hashedOTP } = await generateOTP();
    console.log("OTP généré :", otp);
    await saveOTPToUser(email, hashedOTP);
    console.log("OTP enregistré pour l'utilisateur :", email);
    await sendOTP(email, otp);
    console.log("OTP envoyé à :", email);

    res.status(201).json({ message: "Utilisateur créé avec succès. Veuillez vérifier votre email pour l'OTP.", user: newUser });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// Route pour réinitialiser le mot de passe
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Serveur SMTP d'Outlook
  port: 587, // Port SMTP
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse email
    pass: process.env.EMAIL_PASSWORD, // Votre mot de passe
  },
});
// 📌 Route pour demander une réinitialisation de mot de passe
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("📩 Requête reçue :", req.body);
    const { email } = req.body; 

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠ Utilisateur non trouvé :", email);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure de validité

    // Enregistrer le token et sa date d'expiration dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    console.log("✅ Token enregistré pour :", user.email);

    // 🔗 Construire le lien de réinitialisation avec la syntaxe correcte
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Envoyer un email avec le lien de réinitialisation
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Réinitialisation de mot de passe",
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
            font-size: 24px;
        }
        p {
            font-size: 16px;
            color: #555;
        }
        a {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            font-size: 16px;
            font-weight: bold;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        a:hover {
            background-color: #45a049;
        }
        .footer {
            font-size: 14px;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser votre mot de passe</a>
        <p class="footer">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    </div>
</body>
</html>`,
    };

    console.log("📨 Envoi de l'email à :", user.email);
    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès");

    res.status(200).json({ message: "Un email de réinitialisation a été envoyé" });
  } catch (error) {
    console.error("❌ Erreur dans /forgot-password :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message || error });
  }
});

// Route pour réinitialiser le mot de passe
router.post("/reset-password/:token", async (req, res) => {
  console.log("Reset password route hit");
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    console.log("Requête reçue :", req.body); // Log pour vérifier la requête
    // Trouver l'utilisateur avec le token valide
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Vérifier que le token n'a pas expiré
    });

    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe et effacer le token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

  res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});


// Route pour mettre à jour le profil d'un utilisateur
router.put("/update-profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phoneNumber, role, ...roleSpecificData } = req.body;

    // Trouver l'utilisateur par son ID
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Mettre à jour les champs communs
    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Mettre à jour les champs spécifiques au rôle
    switch (user.role) {
      case "Patient":
        const { name, dateOfBirth, gender, address, emergencyContact, bloodType, allergies } = roleSpecificData;

        if (name) user.name = name;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (address) user.address = address;
        if (emergencyContact) user.emergencyContact = emergencyContact;
        if (bloodType) user.bloodType = bloodType;
        if (allergies) user.allergies = allergies;
        break;

      case "Doctor":
        const { badgeNumber: docBadgeNumber, specialization, licenseNumber: docLicenseNumber } = roleSpecificData;

        if (docBadgeNumber) user.badgeNumber = docBadgeNumber;
        if (specialization) user.specialization = specialization;
        if (docLicenseNumber) user.licenseNumber = docLicenseNumber;
        break;

      case "Nurse":
        const { badgeNumber: nurseBadgeNumber, shift, licenseNumber: nurseLicenseNumber } = roleSpecificData;

        if (nurseBadgeNumber) user.badgeNumber = nurseBadgeNumber;
        if (shift) user.shift = shift;
        if (nurseLicenseNumber) user.licenseNumber = nurseLicenseNumber;
        break;

      case "Administrator":
        const { badgeNumber: adminBadgeNumber } = roleSpecificData;

        if (adminBadgeNumber) user.badgeNumber = adminBadgeNumber;
        break;

      default:
        return res.status(400).json({ message: "Rôle invalide" });
    }

    // Sauvegarder les modifications
    await user.save();

    res.status(200).json({ message: "Profil mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
// Route pour changer le rôle d'un utilisateur (admin uniquement)
router.put("/change-role/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Trouver l'utilisateur par son ID
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Changer le rôle de l'utilisateur
    user.role = role;
    await user.save();

    res.status(200).json({ message: "Rôle de l'utilisateur mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// Send OTP Route
router.post("/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
  
      // Generate OTP
      const { otp, hashedOTP } = await generateOTP();
      
      // Store OTP with expiration (e.g., 5 minutes)
      saveOTPToUser(email, hashedOTP);
  
      // Send OTP to email
      await sendOTP(email, otp);
      
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });
  router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      return res.status(400).json({ message: "Email et OTP sont requis" });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
  
      if (Date.now() > user.otpExpires) {
        return res.status(400).json({ message: "OTP expiré" });
      }
  
      const isValid = await verifyOTP(otp, user.otp);
      if (!isValid) {
        return res.status(400).json({ message: "OTP incorrect" });
      }
  
      // Mettre à jour l'utilisateur après vérification
      user.otpValidated = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: "OTP vérifié avec succès. Vous pouvez maintenant vous connecter." });
    } catch (error) {
      console.error("Erreur lors de la vérification de l'OTP:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  });

  ///////router export 
export default router;
