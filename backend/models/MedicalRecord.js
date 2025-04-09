import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyPatient',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Changé de "Doctor" à "User" pour plus de flexibilité
      required: true,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    knownAllergies: [String],
    chronicConditions: [String],
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Champ virtuel pour les PatientFiles
medicalRecordSchema.virtual('patientFiles', {
  ref: 'PatientFile',
  localField: '_id',
  foreignField: 'medicalRecord'
});

// Méthodes pour Medical Record
medicalRecordSchema.methods.addPatientFile = async function (fileData) {
  try {
    const PatientFile = mongoose.model('PatientFile');
    const newFile = new PatientFile({
      ...fileData,
      medicalRecord: this._id
    });
    await newFile.save();
    return newFile;
  } catch (error) {
    throw new Error(`Error adding patient file: ${error.message}`);
  }
};

medicalRecordSchema.methods.getSummary = function () {
  return {
    id: this._id,
    patient: this.patientId,
    allergies: this.knownAllergies,
    conditions: this.chronicConditions,
    medications: this.currentMedications,
    lastUpdated: this.lastUpdated
  };
};

// Méthode statique pour trouver par patientId avec population
medicalRecordSchema.statics.findByPatientId = async function (patientId) {
  return this.findOne({ patientId })
    .populate('patientId', 'firstName lastName dateOfBirth gender')
    .populate('creator', 'username role specialization')
    .populate({
      path: 'patientFiles',
      options: { sort: { createdAt: -1 } }
    });
};

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;