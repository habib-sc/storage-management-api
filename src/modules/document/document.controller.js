import sendResponse from "../../utils/sendResponse.js";
import { DocumentService } from "./document.service.js";
import httpStatus from "http-status";

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

export const DocumentController = {
  createFolder,
};
