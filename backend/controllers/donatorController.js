import { Donator } from "../models/Donator.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const ensureUploadDir = () => {
  const uploadDir = "uploads/";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadDir}`);
  }
};
ensureUploadDir();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."), false);
  }
};

// Define the maximum file size (50MB)
const maxFileSize = 50 * 1024 * 1024; // 50MB

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize }, // 50MB limit
  fileFilter,
}).single("image");

export const uploadImage = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Starting uploadImage middleware`);
  console.log("Headers received:", req.headers);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Raw request files:", req.files);
  console.log("Raw request body (before multer):", req.body);
  upload(req, res, (err) => {
    console.log(`[${new Date().toISOString()}] Upload middleware executed:`);
    console.log("Error:", err);
    console.log("Uploaded file:", req.file);
    console.log("Parsed body:", req.body);
    console.log("Files (if any):", req.files);

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        const maxSizeMB = maxFileSize / (1024 * 1024);
        return res.status(400).json({ success: false, message: `File too large. Maximum size is ${maxSizeMB}MB.` });
      }
      console.error("Multer error:", err.message, "Stack:", err.stack);
      return res.status(400).json({ success: false, message: "Image upload error", error: err.message });
    } else if (err) {
      console.error("Unexpected error during upload:", err.message, "Stack:", err.stack);
      return res.status(400).json({ success: false, message: "Image upload error", error: err.message });
    }
    if (!req.file) {
      console.error("No file uploaded in request. Expected field name: 'image'");
      return res.status(400).json({ success: false, message: "An image file is required. Ensure the field name is 'image'." });
    }
    if (Object.keys(req.body).length === 0) {
      console.error("Request body is empty. Expected text fields in multipart/form-data.");
      return res.status(400).json({ success: false, message: "Request body is empty. Ensure all form fields are included." });
    }
    console.log("File uploaded successfully:", req.file);
    next();
  });
};

export const getAllDonators = async (req, res) => {
  try {
    const donators = await Donator.find();
    console.log("Fetched donators:", donators);
    res.status(200).json({ success: true, donators });
  } catch (error) {
    console.error("Error fetching donators:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createDonator = async (req, res) => {
  try {
    const {
      name,
      age,
      bloodGroup,
      dateOfBirth,
      contactInfo,
      phoneNumber,
      units,
      hospitalName,
      requestTime,
    } = req.body;

    console.log("Creating donator with data:", req.body);

    if (
      !name ||
      !age ||
      !bloodGroup ||
      !dateOfBirth ||
      !contactInfo ||
      !phoneNumber ||
      !units ||
      !hospitalName ||
      !requestTime
    ) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "An image is required." });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newDonator = new Donator({
      name,
      age: parseInt(age),
      bloodGroup,
      dateOfBirth,
      contactInfo,
      phoneNumber,
      units: parseInt(units),
      hospitalName,
      requestTime,
      imageUrl,
      createdAt: new Date(),
    });

    const savedDonator = await newDonator.save();
    console.log("Donator saved:", savedDonator);
    res.status(201).json({ success: true, message: "Donator created successfully", donator: savedDonator });
  } catch (error) {
    console.error("Error creating donator:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};