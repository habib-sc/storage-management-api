import { AuthService } from "./auth.service.js";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse.js";

const signup = async (req, res, next) => {
  try {
    const result = await AuthService.signup(req.body);

    if (!result?.user?._id) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "User registration failed",
        data: result,
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AuthController = {
  signup,
};
