import Document from "./document.model.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import User from "../user/user.model.js";

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

export const DocumentService = {
  createFolder,
  uploadFile,
  createTextFile,
  getFolderContent,
  getDashboardStats,
};
