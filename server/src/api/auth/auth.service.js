import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  generateVerificationToken,
  generateToken,
} from "../../utils/authUtil.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../../Mail/emails.js";
import { AppError } from "../../utils/appError.js";

export const registerUser = async (userData) => {
  const { name, email, phone, password, role, date_of_birth, gender } =
    userData;

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new AppError("Email or phone number already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const verificationToken = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    date_of_birth,
    gender,
    verified: [false, false],
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 giờ
  });

  await sendVerificationEmail(user.email, verificationToken);

  const token = generateToken(user._id);

  return { user, token }; // Trả về user và token
};

export const loginUser = async (credentials) => {
  const { email, phone, password } = credentials;

  const user = await User.findOne({
    $or: [{ email }, { phone }],
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid login credentials", 401);
  }

  // Tạo token
  const token = generateToken(user._id);

  return { user, token }; // Trả về user và token
};

export const verifyEmailUser = async (code) => {
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  user.verified[0] = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;

  await user.save();
  await sendWelcomeEmail(user.email, user.name);

  return { user };
};

export const forgotPasswordUser = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000;

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpireAt;

  await user.save();
  await sendPasswordResetEmail(
    user.email,
    `${process.env.CLIENT_URL}/api/v1/auth/reset-password/${resetToken}`
  );

  return { message: "Password reset link sent to your email" };
};

export const resetPasswordUser = async (token, password) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const hash_password = await bcrypt.hash(password, 10);
  user.password = hash_password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;

  await user.save();
  await sendResetSuccessEmail(user.email);

  return { message: "Password reset successful" };
};

export const checkAuthUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};

export const completeProfileUser = async (userId, profileData) => {
  const { phone, gender, password } = profileData;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.findById(userId);

  user.phone = phone;
  user.gender = gender;
  user.password = hashedPassword;

  await user.save();
  return { user };
};
