import User from "./user.model.js";

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

const getMe = async (id) => {
  const user = await User.findById(id);
  return user;
};

export const UserService = {
  getAllUsers,
  getMe,
};
