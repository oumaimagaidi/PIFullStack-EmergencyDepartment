import mongoose from "mongoose";

const ocrResultSchema = new mongoose.Schema({
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord",
    required: true,
  },
  originalFilename: {
    type: String,
    required: true,
  },
  textResult: {
    type: String,
    required: true,
  },
  extractedData: {
    patientName: String,
    diagnosis: String,
    tests: [
      {
        testName: String,
        result: String,
        date: Date,
      },
    ],
    treatments: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    confidence: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("OcrResult", ocrResultSchema);