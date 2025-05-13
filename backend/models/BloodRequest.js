import mongoose from "mongoose";

const BloodRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyPatient", 
      required: true,
    },
    requestingStaffId: {
      // The Doctor or Nurse who created the request
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodTypeNeeded: {
      // e.g., "O+", "A-", "AB+", "Universal Donor Needed"
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"], // Or more specific if needed
    },
    quantityNeeded: {
      // e.g., number of units
      type: Number,
      required: true,
      min: 1,
    },
    quantityFulfilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    urgency: {
      type: String,
      required: true,
      enum: ["Critical", "Urgent", "Standard"], // Critical (immediate), Urgent (within hours), Standard (within 24-48h)
      default: "Urgent",
    },
    reason: {
      // Brief reason for the request (e.g., "Surgery", "Trauma", "Anemia")
      type: String,
      required: false, // Optional but good to have
    },
    hospitalLocation: {
      // Specific hospital or department where donation/blood is needed
      type: String,
      required: true, // e.g., "Main Hospital - Blood Bank", "ER Department A"
    },
    contactPerson: {
      // Name or department to contact for donation inquiries
      type: String,
      required: false,
    },
    contactPhone: {
      // Phone number for donation inquiries
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Partially Fulfilled", "Fulfilled", "Closed", "Cancelled"],
      default: "Open",
    },
    notes: {
      // Any additional notes for staff or potential donors
      type: String,
      required: false,
    },
    expiresAt: {
      // Optional: When the request is no longer valid
      type: Date,
      required: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Indexing for better query performance
BloodRequestSchema.index({ status: 1, bloodTypeNeeded: 1, urgency: 1 });
BloodRequestSchema.index({ patientId: 1 });

const BloodRequest = mongoose.model("BloodRequest", BloodRequestSchema);

export default BloodRequest;