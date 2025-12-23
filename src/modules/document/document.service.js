import Document from "./document.model.js";
import path from "path";
import fs from "fs";

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

// create text file service
const createTextFile = async (fileData, ownerId, email) => {
  const { name, content, parentFolder } = fileData;

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

  // create a txt file in uploads/users/{userEmail}/
  const filePath = path.join("uploads", "users", email, `${name}.txt`);
  fs.writeFileSync(filePath, content);

  const textFile = await Document.create({
    name,
    type: "file",
    parentFolder: parentFolder || null,
    owner: ownerId,
    extension: ".txt",
    size: fs.statSync(filePath).size,
    url: `/uploads/users/${email}/${name}.txt`,
  });

  return textFile;
};

// get folder content service
const getFolderContent = async (parentFolderId, ownerId) => {
  const query = {
    owner: ownerId,
    parentFolder: parentFolderId ? parentFolderId : null,
  };

  const content = await Document.find(query).sort({ type: 1, name: 1 });
  return content;
};

export const DocumentService = {
  createFolder,
  uploadFile,
  createTextFile,
  getFolderContent,
};
