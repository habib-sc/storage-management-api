import Document from "./document.model.js";

// Create a new folder
const createFolder = async (folderData, ownerId) => {
  const { name, parentFolder } = folderData;

  // get user root folder
  const rootFolder = await Document.findOne({
    owner: ownerId,
    parentFolder: null,
  });

  // if no root folder then create it
  if (!rootFolder) {
    await Document.create({
      name: "Root",
      type: "folder",
      parentFolder: null,
      owner: ownerId,
    });
  }

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
    parentFolder: parentFolder ? parentFolder : rootFolder?._id,
    owner: ownerId,
  });

  return folder;
};

export const DocumentService = {
  createFolder,
};
