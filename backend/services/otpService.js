// services/otpService.js
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

// Générer un OTP
export const generateOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otp, salt);
  return { otp, hashedOTP };
};

// Sauvegarder l'OTP dans la base de données
export const saveOTPToUser = async (email, hashedOTP) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // Stocker l'OTP et définir une date d'expiration (10 minutes)
  user.otp = hashedOTP;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();
};

// Vérifier l'OTP
export const verifyOTP = async (inputOTP, storedHashedOTP) => {
  return await bcrypt.compare(inputOTP, storedHashedOTP);
};