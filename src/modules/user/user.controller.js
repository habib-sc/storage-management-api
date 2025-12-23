import { UserService } from "./user.service.js";
import httpStatus from "http-status";

const createUser = async (req, res, next) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers();
    res.status(httpStatus.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  createUser,
  getAllUsers,
};
