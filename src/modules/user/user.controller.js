import { UserService } from "./user.service.js";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse.js";

const getAllUsers = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  getAllUsers,
};
