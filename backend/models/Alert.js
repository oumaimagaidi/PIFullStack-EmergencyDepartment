import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  // optional free‑form source identifier (e.g. "Ambulance #123", "System", etc.)
  source: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", AlertSchema);
