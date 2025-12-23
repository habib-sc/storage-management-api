import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt.js";
import User from "../user/user.model.js";

// signup service
const signup = async (userData) => {
  // validate user data
  if (!userData.email || !userData.password) {
    throw new Error("Email and password are required");
  }

  // check if user already exists
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;

  // create user
  const user = await User.create(userData);

  // generate jwt token
  const token = generateToken(user);

  if (!user || !token) {
    throw new Error("Something went wrong");
  }

  return { user, token };
};

// login service
const login = async (userData) => {
  // validate user data
  if (!userData.email || !userData.password) {
    throw new Error("Email and password are required");
  }

  // check if user exists
  const user = await User.findOne({ email: userData.email }, { password: 1 });

  if (!user) {
    throw new Error("User not found");
  }

  // compare password
  const isPasswordMatch = await bcrypt.compare(
    userData.password,
    user.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid password");
  }

  // user detail
  const userDetail = await User.findOne({ email: userData.email });

  // generate jwt token
  const token = generateToken(userDetail);

  if (!userDetail || !token) {
    throw new Error("Something went wrong");
  }

  return { user: userDetail, token };
};

export const AuthService = {
  signup,
  login,
};
