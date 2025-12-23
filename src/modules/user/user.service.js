import User from "./user.model.js";

const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

export const UserService = {
  createUser,
  getAllUsers,
};
