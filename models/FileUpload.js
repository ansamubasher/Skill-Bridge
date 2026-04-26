import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    uploadType: {
      type: String,
      enum: ["proposal", "deliverable", "attachment"],
      default: "attachment",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    description: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FileUpload", fileUploadSchema);
