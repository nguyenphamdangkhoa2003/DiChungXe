import User from "../../models/user.model.js";
import { AppError } from "../../utils/appError.js";

export const getUserService = (userId) => {
  const user = User.findById(userId, { isDeleted: false });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updateUserService = async (userId, updateData) => {
  const { email, ...rest } = updateData;

  const updatedUser = await User.findByIdAndUpdate(userId, rest, { new: true });
  if (!updatedUser) {
    throw new Error("User not found");
  }
  return updatedUser;
};

export const deleteUserService = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
