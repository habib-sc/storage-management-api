import User from "./user.model.js";

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

export const UserService = {
  getAllUsers,
};
