// backend/models/PatientFile.js
import mongoose from "mongoose";

const patientFileSchema = new mongoose.Schema(
  {
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: true,
    },
   
    type: {
      type: String,
      required: true,
      enum: [
        "Triage",
        "Diagnostic",
        "Treatment",
        "VitalSigns",
        "Discharge",
        "Prescription",
        "PatientInformation", // Ajout du nouveau type
      ],
    },
    notes: String,
    dateRecorded: {
      type: Date,
      default: Date.now,
    },
    details: {
      // Pour Triage
      priorityLevel: {
        type: String,
        enum: ["Resuscitation", "Emergency", "Urgent", "Semi-urgent", "Non-urgent"],
      },
      chiefComplaint: String,

      // Pour Diagnostic
      diagnosis: String,
      diagnosticTests: [
        {
          testName: String,
          result: String,
          date: Date,
        },
      ],

      // Pour Treatment
      procedures: [
        {
          name: String,
          date: Date,
          notes: String,
        },
      ],

      // Pour VitalSigns
      vitalSigns: {
        temperature: Number,
        bloodPressure: {
          systolic: Number,
          diastolic: Number,
        },
        heartRate: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number,
      },

      // Pour Discharge
      dischargeInstructions: String,
      followUpDate: Date,

      // Pour Prescription
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
        },
      ],

      // Pour PatientInformation (basé sur EmergencyPatient)
      patientInfo: {
        firstName: String,
        lastName: String,
        dateOfBirth: String,
        gender: String,
        phoneNumber: String,
        email: String,
        address: String,
        emergencyContact: String,
        insuranceInfo: String,
        allergies: String,
        currentMedications: String,
        medicalHistory: String,
        currentSymptoms: String,
        painLevel: String,
        emergencyLevel: String,
      },
    },
  },
  { timestamps: true }
);

patientFileSchema.methods.updateFile = function (updateData) {
  console.log(`Updating patient file ${this._id}`);
};

patientFileSchema.methods.getFileType = function () {
  return this.type;
};

const PatientFile = mongoose.model("PatientFile", patientFileSchema);

export default PatientFile;