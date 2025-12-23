import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    extension: {
      type: String,
    },
    size: {
      type: Number,
    },
    url: {
      type: String,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index(
  { name: 1, type: 1, parentFolder: 1, owner: 1 },
  { unique: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
