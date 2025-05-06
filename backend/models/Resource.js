import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  type: { type: String, required: true },       // e.g. 'bed', 'ventilator'
  name: { type: String, required: true },       // e.g. 'ICU Bed 1'
  quantity: { type: Number, required: true, min: 0 },
  location: { type: String, required: true },   
  status: { type: String, required: true, enum: ['available','in-maintenance'] },
  allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },

}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);