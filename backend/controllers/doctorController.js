import { User, Doctor } from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png) are allowed!"));
  },
});

export const uploadImage = upload.fields([{ name: "profileImage", maxCount: 1 }]);

export const getAllDoctors = async (req, res) => {
  console.log("Inside getAllDoctors function"); // Debug log
  try {
    if (!req.user || !req.user.role) {
      console.log("Authentication check failed: user or role missing"); // Debug log
      return res.status(401).json({ success: false, message: "User not authenticated or role missing" });
    }
    console.log("Fetching doctors for user:", req.user); // Debug log

    // Explicitly filter for role: "Doctor" to ensure the query aligns with the discriminator
    const doctors = await Doctor.find({ role: "Doctor" }).select(
      "-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires"
    );
    console.log("Fetched doctors from DB:", doctors); // Debug log

    // Additional debug: Check total users and doctors in the database
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "Doctor" });
    console.log(`Total users in DB: ${totalUsers}, Total doctors in DB: ${totalDoctors}`); // Debug log

    if (!doctors || doctors.length === 0) {
      console.log("No doctors found in DB, returning empty array"); // Debug log
      return res.status(200).json({ success: true, message: "No doctors found", doctors: [] });
    }

    console.log("Returning doctors:", doctors); // Debug log
    res.status(200).json({ success: true, message: "Doctors retrieved successfully", doctors });
  } catch (error) {
    console.error("Error in getAllDoctors:", error); // Debug log
    res.status(500).json({ success: false, message: "Server error fetching doctors", error: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "User not authenticated or role missing" });
    }
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Access denied: Only administrators can create doctors" });
    }
    console.log("Creating doctor with body:", req.body);
    console.log("Files received:", req.files);

    const { username, email, password, phoneNumber, specialization, licenseNumber, badgeNumber } = req.body;

    const errors = {};
    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email must be valid (example@domain.com)";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (!/^\d{9,}$/.test(phoneNumber)) errors.phoneNumber = "Phone number must be at least 9 digits";
    if (!specialization) errors.specialization = "Specialization is required";
    if (!licenseNumber) errors.licenseNumber = "License number is required";
    else if (!/^\d+$/.test(licenseNumber)) errors.licenseNumber = "License number must be numeric";
    if (!badgeNumber) errors.badgeNumber = "Badge number is required";
    else if (!/^\d+$/.test(badgeNumber)) errors.badgeNumber = "Badge number must be numeric";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: "This email is already in use", errors: { email: "This email is already in use" } });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ success: false, message: "This username is already in use", errors: { username: "This username is already in use" } });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImage = null;
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      profileImage = `/uploads/${req.files.profileImage[0].filename}`;
    }

    const newDoctor = new Doctor({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "Doctor",
      isValidated: true,
      specialization,
      licenseNumber,
      badgeNumber,
      profileImage,
    });

    await newDoctor.save();
    res.status(201).json({ success: true, message: "Doctor created successfully", doctor: newDoctor });
  } catch (error) {
    console.error("Error creating doctor:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    }
    res.status(500).json({ success: false, message: "Server error creating doctor", error: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "User not authenticated or role missing" });
    }
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Access denied: Only administrators can update doctors" });
    }

    const { id } = req.params;
    const { username, email, phoneNumber, specialization, licenseNumber, badgeNumber } = req.body;

    const errors = {};
    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email must be valid (example@domain.com)";
    if (!phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (!/^\d{9,}$/.test(phoneNumber)) errors.phoneNumber = "Phone number must be at least 9 digits";
    if (!specialization) errors.specialization = "Specialization is required";
    if (!licenseNumber) errors.licenseNumber = "License number is required";
    else if (!/^\d+$/.test(licenseNumber)) errors.licenseNumber = "License number must be numeric";
    if (!badgeNumber) errors.badgeNumber = "Badge number is required";
    else if (!/^\d+$/.test(badgeNumber)) errors.badgeNumber = "Badge number must be numeric";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const existingDoctorByEmail = await User.findOne({ email, _id: { $ne: id } });
    if (existingDoctorByEmail) {
      return res.status(400).json({ success: false, message: "This email is already in use by another doctor", errors: { email: "This email is already in use" } });
    }

    const existingDoctorByUsername = await User.findOne({ username, _id: { $ne: id } });
    if (existingDoctorByUsername) {
      return res.status(400).json({ success: false, message: "This username is already in use by another doctor", errors: { username: "This username is already in use" } });
    }

    const updateData = {
      username,
      email,
      phoneNumber,
      specialization,
      licenseNumber,
      badgeNumber,
    };

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      updateData.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
    } else {
      updateData.profileImage = doctor.profileImage || null;
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires");

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    }
    res.status(500).json({ success: false, message: "Server error updating doctor", error: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "User not authenticated or role missing" });
    }
    if (req.user.role !== "Administrator") {
      return res.status(403).json({ success: false, message: "Access denied: Only administrators can delete doctors" });
    }

    const { id } = req.params;
    const doctor = await Doctor.findOneAndDelete({ _id: id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ success: false, message: "Server error deleting doctor", error: error.message });
  }
};