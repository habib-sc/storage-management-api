import Document from "./document.model.js";
import path from "path";

// Create a new folder
const createFolder = async (folderData, ownerId) => {
  const { name, parentFolder } = folderData;

  // If parentFolder is provided, verify it exists and belongs to owner
  if (parentFolder) {
    const parent = await Document.findOne({
      _id: parentFolder,
      owner: ownerId,
    });
    if (!parent) {
      throw new Error("Parent folder not found or unauthorized");
    }
  }

  const folder = await Document.create({
    name,
    type: "folder",
    parentFolder: parentFolder ? parentFolder : null,
    owner: ownerId,
  });

  return folder;
};

// Upload a file service
const uploadFile = async (fileData, file, ownerId) => {
  const { parentFolder } = fileData;

  // Validate parent folder
  if (parentFolder) {
    const parent = await Document.findOne({
      _id: parentFolder,
      owner: ownerId,
    });
    if (!parent) {
      throw new Error("Parent folder not found or unauthorized");
    }
    if (parent.type !== "folder") {
      throw new Error("Parent must be a folder");
    }
  }

  const newFile = await Document.create({
    name: file.originalname,
    type: "file",
    parentFolder: parentFolder ? parentFolder : null,
    owner: ownerId,
    extension: path?.extname(file.originalname),
    size: file?.size,
    url: `/${file?.destination}/${file?.filename}`,
  });

  return newFile;
};

export const DocumentService = {
  createFolder,
  uploadFile,
};
