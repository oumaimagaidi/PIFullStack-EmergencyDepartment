import mongoose from "mongoose";

const DonationPledgeSchema = new mongoose.Schema(
  {
    bloodRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    donorUserId: { // The user who is pledging to donate
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donorName: { // Store name at time of pledge for easier display
        type: String,
        required: true,
    },
    donorContactPhone: {
        type: String,
        required: true,
    },
    donorBloodType: { // Good to confirm, though the request has the needed type
        type: String,
        required: true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
    },
    pledgedQuantity: { // How many units they are pledging
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    status: { // Status of this specific pledge
      type: String,
      enum: ["Pledged", "Scheduled", "Donated", "Cancelled"],
      default: "Pledged",
    },
    donationDateScheduled: { // Optional: if a specific date is scheduled
        type: Date,
    },
    donationNotes: { // Any notes from the donor
        type: String,
    }
  },
  { timestamps: true }
);

DonationPledgeSchema.index({ bloodRequestId: 1, donorUserId: 1 }); // Optimize queries

const DonationPledge = mongoose.model("DonationPledge", DonationPledgeSchema);

export default DonationPledge;