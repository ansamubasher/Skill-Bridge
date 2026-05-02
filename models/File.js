import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
    },

    fileType: {
      type: String, // e.g. image/png, application/pdf
    },

    purpose: {
      type: String,
      enum: ["attachment", "deliverable", "portfolio"],
      default: "attachment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);