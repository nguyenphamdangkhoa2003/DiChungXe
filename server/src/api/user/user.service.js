import User from '../../models/user.model.js';
import { AppError } from '../../utils/appError.js';
import cloudinary from '../../config/cloundinary.config.js';

export const getUserService = (userId) => {
    const user = User.findById(userId, { isDeleted: false });
    if (!user) throw new AppError('User not found', 404);
    return user;
};

export const updateUserService = async (userId, updateData, file) => {
    let updatePayload = { ...updateData };
    if (file) {
        if (file) {
            updatePayload.profile_image = file.path;
            const user = await User.findById(userId);
            if (user.profile_image) {
                const publicId = user.profile_image
                    .split('/')
                    .pop()
                    .split('.')[0];
                await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
            }
        }
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
        new: true,
    });

    if (!updatedUser) {
        throw new Error('User not found');
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
        throw new Error('User not found');
    }

    return user;
};
