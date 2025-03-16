import mongoose from "mongoose";

const donatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  dateOfBirth: { type: String, required: true },
  contactInfo: { type: String, required: true },
  phoneNumber: { type: String, required: true, match: /^\+\d{10,15}$/ },
  units: { type: Number, required: true, min: 1 },
  hospitalName: { type: String, required: true },
  requestTime: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Donator = mongoose.model("Donator", donatorSchema);