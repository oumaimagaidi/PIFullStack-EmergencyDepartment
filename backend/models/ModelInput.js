import mongoose from 'mongoose';

const modelInputSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyPatient',
      required: true
    },
    features: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
      // Example: {
      //   "cc_abdominal_pain": 0.87,
      //   "meds_antibiotics": 0.55,
      //   "triage_vital_hr": 98,
      //   "age": 46,
      //   "gender": "male"
      // }
    },
    prediction: {
      type: String,
      enum: ['Admit', 'Discharge'],
      default: null
    },
    probability: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

const ModelInput = mongoose.model('ModelInput', modelInputSchema);
export default ModelInput;
