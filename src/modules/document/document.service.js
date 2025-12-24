import Document from "./document.model.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import User from "../user/user.model.js";
import Favourite from "./favourite.model.js";

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
const getFolderContent = async (queryParams, ownerId) => {
  const queries = {};

  // filterable fields
  const filterableFields = ["parentFolder", "type", "extension"];

  filterableFields.forEach((field) => {
    if (queryParams[field]) {
      queries[field] = queryParams[field];
    }
  });

  const andConditions = [];

  if (queryParams.type === "image") {
    andConditions.push({
      extension: { $in: [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
    });
    queries.type = "file";
  }

  if (queryParams.type === "note") {
    andConditions.push({ extension: ".txt" });
    queries.type = "file";
  }

  if (andConditions.length > 0) {
    queries.$and = andConditions;
  }

  queries.owner = ownerId;
  queries.parentFolder = queryParams.parentFolder
    ? queryParams.parentFolder
    : null;

  const totalItems = await Document.countDocuments(queries);

  const content = await Document.find(queries);
  return { totalItems, content };
};

// get dashboard statistics service
const getDashboardStats = async (user) => {
  if (!user) {
    throw new Error("User not found");
  }

  const userId = user.id;
  const userData = await User.findById(userId, {
    totalStorageCapacity: 1,
  });
  const totalStorageCapacity =
    userData?.totalStorageCapacity || 5 * 1024 * 1024 * 1024;

  const ownerId = new mongoose.Types.ObjectId(userId);

  const stats = await Document.aggregate([
    {
      $match: {
        owner: ownerId,
      },
    },
    {
      $facet: {
        storage: [
          { $match: { type: "file" } },
          { $group: { _id: null, usedStorage: { $sum: "$size" } } },
        ],

        folder: [
          { $match: { type: "folder" } },
          { $group: { _id: null, totalItems: { $sum: 1 } } },
        ],

        text: [
          { $match: { type: "file", extension: ".txt" } },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              usedStorage: { $sum: "$size" },
            },
          },
        ],

        image: [
          {
            $match: {
              type: "file",
              extension: { $in: [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
            },
          },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              usedStorage: { $sum: "$size" },
            },
          },
        ],

        pdf: [
          { $match: { type: "file", extension: ".pdf" } },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              usedStorage: { $sum: "$size" },
            },
          },
        ],
      },
    },
  ]);

  const usedStorage = stats[0].storage[0].usedStorage || 0;

  const dashboardData = {
    storage: {
      totalStorageCapacity,
      usedStorage,
      availableStorage: totalStorageCapacity - usedStorage,
    },
    folder: {
      totalItems: stats[0].folder[0]?.totalItems || 0,
      usedStorage,
    },
    text: {
      totalItems: stats[0].text[0]?.totalItems || 0,
      usedStorage: stats[0].text[0]?.usedStorage || 0,
    },
    image: {
      totalItems: stats[0].image[0]?.totalItems || 0,
      usedStorage: stats[0].image[0]?.usedStorage || 0,
    },
    pdf: {
      totalItems: stats[0].pdf[0]?.totalItems || 0,
      usedStorage: stats[0].pdf[0]?.usedStorage || 0,
    },
  };

  return dashboardData;
};

// toggle favourite service
const toggleFavourite = async (documentId, userId) => {
  // Check if document exists
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  // Check if already favourited
  const existingFavourite = await Favourite.findOne({
    user: userId,
    document: documentId,
  });

  if (existingFavourite) {
    // If exists, remove it
    await Favourite.findByIdAndDelete(existingFavourite._id);
    return { isFavourite: false };
  } else {
    // If doesn't exist, create it
    await Favourite.create({
      user: userId,
      document: documentId,
    });
    return { isFavourite: true };
  }
};

// get favourite documents service
const getFavouriteDocuments = async (userId) => {
  const favourites = await Favourite.find({ user: userId }).populate(
    "document"
  );

  return { totalItems: favourites.length, content: favourites };
};

// duplicate document service
const duplicateDocument = async (
  documentId,
  ownerId,
  targetParentId = null
) => {
  // Find source document
  const sourceDoc = await Document.findOne({ _id: documentId, owner: ownerId });
  if (!sourceDoc) {
    throw new Error("Document not found or unauthorized");
  }

  const { name, type, parentFolder, extension, size, url, content } = sourceDoc;

  // Create the new document
  const newName =
    type === "folder"
      ? `${name}_copy`
      : `${path.basename(name, extension)}_copy${extension}`;

  // check if new name alrady exist then add _copy again and again
  let newDocName = newName;
  let count = 1;
  while (
    await Document.findOne({
      name: newDocName,
      owner: ownerId,
      parentFolder: targetParentId || parentFolder,
    })
  ) {
    newDocName =
      type === "folder"
        ? `${name}_copy_${count}`
        : `${path.basename(name, extension)}_copy_${count}${extension}`;
    count++;
  }

  let newUrl = url;
  if (type === "file" && url) {
    // Physical file copying logic
    const oldPath = path.join(process.cwd(), url);
    const dirName = path.dirname(url);
    const fileName = path.basename(url, extension);
    const newFileName = `${newDocName}`;
    newUrl = path.join(dirName, newFileName).replace(/\\/g, "/");
    const newPath = path.join(process.cwd(), newUrl);

    if (fs.existsSync(oldPath)) {
      // Create directory if it doesn't exist
      const targetDir = path.dirname(newPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(oldPath, newPath);
    }
  }

  const newDoc = await Document.create({
    name: newDocName,
    type,
    parentFolder: targetParentId || parentFolder,
    owner: ownerId,
    extension,
    size,
    url: newUrl,
    content,
  });

  // If it's a folder then copy its children
  if (type === "folder") {
    const children = await Document.find({
      parentFolder: documentId,
      owner: ownerId,
    });

    for (const child of children) {
      await duplicateDocument(child._id, ownerId, newDoc._id);
    }
  }

  return newDoc;
};

// rename document service
const renameDocument = async (documentId, newName, userId) => {
  const document = await Document.findOne({ _id: documentId, owner: userId });
  if (!document) {
    throw new Error("Document not found or unauthorized");
  }

  const { type, extension, url } = document;

  // check if the name already exist with the same parent folder
  const existingDocument = await Document.findOne({
    name: newName,
    owner: userId,
    parentFolder: document.parentFolder,
  });

  if (existingDocument) {
    throw new Error("Document name already exists");
  }

  let updateData = { name: newName };

  if (type === "file" && url) {
    const oldPath = path.join(process.cwd(), url);
    const dirName = path.dirname(url);

    // Construct new physical filename
    // We keep the extension from the original document
    const newPhysicalFileName = `${newName}${extension || path.extname(url)}`;
    const newUrl = path.join(dirName, newPhysicalFileName).replace(/\\/g, "/");
    const newPath = path.join(process.cwd(), newUrl);

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }

    updateData.url = newUrl;
  }

  const updatedDoc = await Document.findByIdAndUpdate(documentId, updateData, {
    new: true,
  });

  return updatedDoc;
};

export const DocumentService = {
  createFolder,
  uploadFile,
  createTextFile,
  getFolderContent,
  getDashboardStats,
  toggleFavourite,
  getFavouriteDocuments,
  duplicateDocument,
  renameDocument,
};
