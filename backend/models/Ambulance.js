import mongoose from 'mongoose';

const AmbulanceSchema = new mongoose.Schema({
  name : { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['OFF_DUTY', 'AVAILABLE', 'ON_MISSION', 'MAINTENANCE'], 
    required: true 
  },
  destination: { type: String, default: null },
  lastUpdated: { type: Date, default: Date.now },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Ambulance = mongoose.model('Ambulance', AmbulanceSchema);
export default Ambulance;