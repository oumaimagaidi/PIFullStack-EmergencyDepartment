import mongoose from "mongoose"

const AnnotationSchema = new mongoose.Schema(
  {
    patientFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientFile",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    position: {
      x: Number,
      y: Number,
    },
    type: {
      type: String,
      enum: ["comment", "highlight", "warning", "question"],
      default: "comment",
    },
    color: {
      type: String,
      default: "#FFD700", // Default yellow color
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Annotation", AnnotationSchema)
