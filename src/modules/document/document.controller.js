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

export const DocumentController = {
  createFolder,
  uploadFile,
  createTextFile,
};
