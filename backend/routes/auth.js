import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { generateOTP, saveOTPToUser, verifyOTP } from "../services/otpService.js";
import { sendOTP } from "../services/emailService.js";
import { OAuth2Client } from "google-auth-library";
import multer from "multer";
import path from "path";
import upload from "../middleware/uploadMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import sendSMS from "../sendSMS.js";
import axios from "axios";
import cors from "cors";
import fs from "fs";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

router.use(cors({ origin: "http://localhost:3000", credentials: true }));
dotenv.config();

// Log environment variables to debug
console.log("RECAPTCHA_SECRET_KEY:", process.env.RECAPTCHA_SECRET_KEY);

const verifyReCaptchaToken = async (req, res, next) => {
  const { recaptchaToken } = req.body;
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  console.log("Received recaptchaToken:", recaptchaToken);
  if (!recaptchaToken) {
    console.log("No recaptchaToken provided");
    return res.status(400).json({ message: "reCAPTCHA token manquant" });
  }

  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY is not defined in environment variables");
    return res.status(500).json({ message: "Erreur de configuration serveur : Clé secrète reCAPTCHA manquante" });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: recaptchaToken,
        },
      }
    );
    console.log("reCAPTCHA API response:", response.data);
    const { success, "error-codes": errorCodes } = response.data;

    if (!success) {
      console.log("reCAPTCHA verification failed with error codes:", errorCodes);
      return res.status(400).json({ message: "Échec de la vérification reCAPTCHA", errorCodes });
    }
    next();
  } catch (error) {
    console.error("reCAPTCHA verification error:", error.response?.data || error.message);
    res.status(500).json({ message: "Erreur lors de la vérification reCAPTCHA", error: error.message });
  }
};

// Temporary storage for QR codes (in a real app, use a database like Redis)
const qrCodes = new Map();

router.get("/generate-qr-code", (req, res) => {
  try {
    console.log("Received request to generate QR code...");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    qrCodes.set(code, { expiresAt });

    console.log("Generated QR code:", code);
    res.status(200).json({ code });
  } catch (error) {
    console.error("Error generating QR code:", error.stack || error.message);
    res.status(500).json({ message: "Erreur lors de la génération du code QR. Détails : " + (error.message || "Inconnu") });
  }
});

router.get("/qr-code", (req, res) => {
  const { code } = req.query;

  if (!code || !qrCodes.has(code)) {
    return res.status(400).send("<h1>Code QR invalide ou expiré.</h1>");
  }

  const qrData = qrCodes.get(code);
  if (Date.now() > qrData.expiresAt) {
    qrCodes.delete(code);
    return res.status(400).send("<h1>Code QR expiré.</h1>");
  }

  res.send(`
    <h1>Votre code QR</h1>
    <p>Entrez ce code dans l'application pour vous connecter :</p>
    <h2>${code}</h2>
    <p>Ce code expire dans 5 minutes.</p>
  `);
});

router.post("/qr-login", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code QR manquant" });
    }

    if (!qrCodes.has(code)) {
      return res.status(400).json({ message: "Code QR invalide" });
    }

    const qrData = qrCodes.get(code);
    if (Date.now() > qrData.expiresAt) {
      qrCodes.delete(code);
      return res.status(400).json({ message: "Code QR expiré" });
    }

    let user = await User.findOne({ email: "default@example.com" });
    if (!user) {
      user = new User({
        username: `user_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
        password: crypto.randomBytes(8).toString("hex"),
        role: "Patient",
        phoneNumber: "1234567890",
        bloodType: "O+",
        emergencyContact: "1234567890",
        address: "Default Address",
        dateOfBirth: new Date("1990-01-01"),
        name: `User ${Date.now()}`,
        gender: "Male",
        isValidated: true,
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      gender: user.gender || "Male",
      profilePicture: user.profilePicture,
    };

    qrCodes.delete(code);

    res.status(200).json({ message: "Connexion réussie via QR code", user: userResponse, token: jwtToken });
  } catch (error) {
    console.error("QR login error:", error.stack || error.message);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(", ");
      return res.status(400).json({
        message: "Erreur de validation lors de la création de l'utilisateur : " + validationErrors,
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Erreur lors de la connexion via QR code",
      error: error.message,
    });
  }
});

router.post("/login", verifyReCaptchaToken, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    if (!user.isValidated) {
      if (user.role === "Patient")
        return res.status(400).json({ message: "Votre compte est en attente de validation de mail via otp" });
      return res.status(400).json({ message: "Votre compte est en attente de validation par un administrateur" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Generated Token:", token);
    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      gender: user.gender || "unknown",
      profilePicture: user.profilePicture,
    };
    console.log("User data sent to frontend:", userResponse);

    res.status(200).json({ message: "Connexion réussie", user: userResponse, token });
  } catch (error) {
    console.error("Erreur serveur:", error.stack || error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  console.log("Logout route hit");
  res.clearCookie("token", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  res.status(200).json({ message: "Déconnexion réussie" });
});

router.get("/me", authenticateToken, (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

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
    console.error("Erreur Google Login:", error.stack || error.message);
    res.status(500).json({ message: "Erreur lors de l'authentification Google", error: error.message });
  }
});

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, email, password, phoneNumber, role, ...roleSpecificData } = req.body;

    console.log("Données reçues :", req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email déjà utilisé :", email);
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isValidated = false;

    const newUserData = {
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      isValidated,
      profileImage: req.file ? `/uploads/${req.file.filename}` : null,
    };

    switch (role) {
      case "Patient":
        const { name, dateOfBirth, gender, address, emergencyContact, bloodType, allergies } = roleSpecificData;

        if (!name || !dateOfBirth || !gender || !address || !emergencyContact || !bloodType) {
          console.log("Champs obligatoires manquants pour un patient");
          return res.status(400).json({ message: "Tous les champs obligatoires pour un patient doivent être remplis" });
        }

        newUserData.name = name;
        newUserData.dateOfBirth = dateOfBirth;
        newUserData.gender = gender;
        newUserData.address = address;
        newUserData.emergencyContact = emergencyContact;
        newUserData.bloodType = bloodType;
        newUserData.allergies = allergies || [];
        break;

      case "Doctor":
        const { badgeNumber: docBadgeNumber, specialization, licenseNumber: docLicenseNumber } = roleSpecificData;

        if (!docBadgeNumber || !specialization || !docLicenseNumber) {
          console.log("Champs obligatoires manquants pour un médecin");
          return res.status(400).json({ message: "Tous les champs obligatoires pour un médecin doivent être remplis" });
        }

        newUserData.badgeNumber = docBadgeNumber;
        newUserData.specialization = specialization;
        newUserData.licenseNumber = docLicenseNumber;
        break;

      case "Nurse":
        const { badgeNumber: nurseBadgeNumber, shift, licenseNumber: nurseLicenseNumber } = roleSpecificData;

        if (!nurseBadgeNumber || !shift || !nurseLicenseNumber) {
          console.log("Champs obligatoires manquants pour une infirmière");
          return res.status(400).json({ message: "Tous les champs obligatoires pour une infirmière doivent être remplis" });
        }

        newUserData.badgeNumber = nurseBadgeNumber;
        newUserData.shift = shift;
        newUserData.licenseNumber = nurseLicenseNumber;
        break;

      case "Administrator":
        const { badgeNumber: adminBadgeNumber } = roleSpecificData;

        if (!adminBadgeNumber) {
          console.log("Champs obligatoires manquants pour un administrateur");
          return res.status(400).json({ message: "Le numéro de badge est obligatoire pour un administrateur" });
        }

        newUserData.badgeNumber = adminBadgeNumber;
        break;

      default:
        console.log("Rôle invalide :", role);
        return res.status(400).json({ message: "Rôle invalide" });
    }

    const newUser = new User(newUserData);
    await newUser.save();
    console.log("Utilisateur créé avec succès :", newUser);

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`Fichier supprimé : ${req.file.path}`);
      } catch (unlinkError) {
        console.error(`Erreur lors de la suppression du fichier ${req.file.path} :`, unlinkError.message);
      }
    }

    const { otp, hashedOTP } = await generateOTP();
    console.log("OTP généré :", otp);
    await saveOTPToUser(email, hashedOTP);
    console.log("OTP enregistré pour l'utilisateur :", email);
    await sendOTP(email, otp);
    console.log("OTP envoyé à :", email);

    const smsMessage = `Bienvenue ${username}, votre inscription a été réussie ! Veuillez vérifier votre email pour l'OTP.`;
    await sendSMS(smsMessage, phoneNumber);
    console.log("SMS envoyé à :", phoneNumber);

    res.status(201).json({ message: "Utilisateur créé avec succès. Veuillez vérifier votre email pour l'OTP.", user: newUser });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error.stack || error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/forgot-password", async (req, res) => {
  try {
    console.log("📩 Requête reçue :", req.body);
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠ Utilisateur non trouvé :", email);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    console.log("✅ Token enregistré pour :", user.email);

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

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
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; text-align: center; }
        .container { width: 100%; max-width: 600px; margin: 50px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
        h2 { color: #333; font-size: 24px; }
        p { font-size: 16px; color: #555; }
        a { display: inline-block; background-color: #4CAF50; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        a:hover { background-color: #45a049; }
        .footer { font-size: 14px; color: #888; margin-top: 20px; }
    </style>
</head>
<body>
    <div className="container">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser votre mot de passe</a>
        <p className="footer">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    </div>
</body>
</html>`,
    };

    console.log("📨 Envoi de l'email à :", user.email);
    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès");

    res.status(200).json({ message: "Un email de réinitialisation a été envoyé" });
  } catch (error) {
    console.error("❌ Erreur dans /forgot-password :", error.stack || error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message || error });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  console.log("Reset password route hit");
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    console.log("Requête reçue :", req.body);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.stack || error.message });
  }
});

router.put("/update-profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phoneNumber, role, ...roleSpecificData } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;

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

    await user.save();

    res.status(200).json({ message: "Profil mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.stack || error.message });
  }
});

router.put("/change-role/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Rôle de l'utilisateur mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.stack || error.message });
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const { otp, hashedOTP } = await generateOTP();
    saveOTPToUser(email, hashedOTP);
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error.stack || error.message);
    res.status(500).json({ message: "Server error", error: error.message });
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
      if (user.role === "Patient") user.isValidated = true;
      return res.status(400).json({ message: "OTP incorrect" });
    }

    user.otpValidated = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isValidated = true;
    await user.save();

    res.status(200).json({ message: "OTP vérifié avec succès. Vous pouvez maintenant vous connecter." });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'OTP:", error.stack || error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.post("/send-sms", async (req, res) => {
  const { body, phoneNumber } = req.body;

  if (!body || !phoneNumber) {
    return res.status(400).json({ success: false, message: "Body and phone number are required" });
  }

  try {
    const result = await sendSMS(body, phoneNumber);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error(error.stack || error.message);
    return res.status(500).json({ success: false, message: "Failed to send SMS", error: error.message });
  }
});

export default router;