import sendResponse from "../../utils/sendResponse.js";
import { DocumentService } from "./document.service.js";
import httpStatus from "http-status";

// create folder controller
const createFolder = async (req, res, next) => {
  try {
    // get userinfo from token
    const user = req.user;

    const result = await DocumentService.createFolder(req.body, user.id);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Folder created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// upload file controller
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const result = await DocumentService.uploadFile(
      req.body,
      req.file,
      req.user.id,
      req.user.email
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "File uploaded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// create text file controller
const createTextFile = async (req, res, next) => {
  try {
    const result = await DocumentService.createTextFile(
      req.body,
      req.user.id,
      req.user.email
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Text file created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get folder content controller
const getFolderContent = async (req, res, next) => {
  try {
    const result = await DocumentService.getFolderContent(
      req.query,
      req.user.id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Content retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get dashboard stats controller
const getDashboardStats = async (req, res, next) => {
  try {
    const result = await DocumentService.getDashboardStats(req.user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// toggle favourite controller
const toggleFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await DocumentService.toggleFavourite(id, req.user.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.isFavourite
        ? "Document marked as favourite"
        : "Document removed from favourites",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get favourite documents controller
const getFavouriteDocuments = async (req, res, next) => {
  try {
    const result = await DocumentService.getFavouriteDocuments(req.user.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Favourite documents retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// duplicate document controller
const duplicateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await DocumentService.duplicateDocument(id, req.user.id);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Document duplicated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// copy to folder controller
const copyToFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetFolderId } = req.body;
    const result = await DocumentService.duplicateDocument(
      id,
      req.user.id,
      targetFolderId
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Document copied to folder successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// rename document controller
const renameDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await DocumentService.renameDocument(id, name, req.user.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document renamed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete document controller
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await DocumentService.deleteDocument(id, req.user.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Document deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const DocumentController = {
  createFolder,
  uploadFile,
  createTextFile,
  getFolderContent,
  getDashboardStats,
  toggleFavourite,
  getFavouriteDocuments,
  duplicateDocument,
  copyToFolder,
  renameDocument,
  deleteDocument,
};
