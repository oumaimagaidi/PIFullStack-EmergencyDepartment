import mongoose from "mongoose";

const patientFileSchema = new mongoose.Schema(
  {
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: true,
    },
    ocrResults: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OcrResult'
    },
    isOCRProcessed: {
      type: Boolean,
      default: false
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
        "PatientInformation",
      ],
    },

    notes: String,

    dateRecorded: {
      type: Date,
      default: Date.now,
    },

    // Détails spécifiques selon le type
    details: {
      priorityLevel: {
        type: String,
        enum: ["Resuscitation", "Emergency", "Urgent", "Semi-urgent", "Non-urgent"],
      },
      treatments: [{
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date
      }],
      chiefComplaint: String,

      diagnosis: String,
      diagnosticTests: [
        {
          testName: String,
          result: String,
          date: Date,
        },
      ],

      procedures: [
        {
          name: String,
          date: Date,
          notes: String,
        },
      ],

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

      dischargeInstructions: String,
      followUpDate: Date,

      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
        },
      ],

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

    // 🔒 ARCHIVAGE
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    archiveReason: {
      type: String,
      default: null,
    },

    restoredAt: {
      type: Date,
      default: null,
    },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    restoreReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Méthodes personnalisées
patientFileSchema.methods.updateFile = function (updateData) {
  console.log(`Updating patient file ${this._id}`);
};

patientFileSchema.methods.getFileType = function () {
  return this.type;
};

const PatientFile = mongoose.model("PatientFile", patientFileSchema);

export default PatientFile;
