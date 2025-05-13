import mongoose from 'mongoose';

const AmbulanceRequestSchema = new mongoose.Schema({
  patient: {
    name: { type: String, required: true },
    phone: { 
      type: String, 
      required: true,
      match: [/^[0-9]{8,15}$/, "Please enter a valid phone number"]
    },
    location: {
      latitude: { type: Number }, // Removed required: true
      longitude: { type: Number } // Removed required: true
    }
  },
  ambulance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance' // Removed required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  emergencyType: {
    type: String,
    required: true,
    enum: ['CRITICAL', 'URGENT', 'NON_URGENT']
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
AmbulanceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const AmbulanceRequest = mongoose.model('AmbulanceRequest', AmbulanceRequestSchema);
export default AmbulanceRequest;