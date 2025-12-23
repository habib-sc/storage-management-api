import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt.js";
import User from "../user/user.model.js";
import agenda from "../../config/agenda.js";

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

// forgot password service
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // generate 6 digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = verificationCodeExpires;
  await user.save();

  // send email in background
  const subject = "Password Reset Verification Code";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;

  await agenda.now("send-email", { to: email, subject, html });

  return {
    message: "Verification code sent to email",
    verificationCode,
    note: "This code will display here until development and test finished",
  };
};

// verify code service
const verifyCode = async (email, code) => {
  const user = await User.findOne(
    { email },
    { verificationCode: 1, verificationCodeExpires: 1 }
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (user.verificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  if (new Date() > user.verificationCodeExpires) {
    throw new Error("Verification code has expired");
  }

  return {
    isVerified: true,
    message: "Code verified successfully",
  };
};

// reset password service
const resetPassword = async (
  verificationCode,
  email,
  newPassword,
  confirmPassword
) => {
  if (!verificationCode || !email || !newPassword || !confirmPassword) {
    throw new Error(
      "Required fields are 'verificationCode', 'email', 'newPassword', 'confirmPassword'"
    );
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const user = await User.findOne(
    { email },
    { verificationCode: 1, verificationCodeExpires: 1, password: 1 }
  );

  if (!user) {
    throw new Error("User not found");
  }

  // verify code
  const verificationResult = await verifyCode(email, verificationCode);

  if (!verificationResult.isVerified) {
    throw new Error("Invalid verification code");
  }

  // hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // clear verification fields
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save();

  return { message: "Password reset successfully" };
};

export const AuthService = {
  signup,
  login,
  forgotPassword,
  verifyCode,
  resetPassword,
};
