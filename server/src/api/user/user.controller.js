import {
    getUserService,
    updateUserService,
    deleteUserService,
} from './user.service.js';

export const getUser = async (req, res, next) => {
    try {
        const user = await getUserService(req.userId);
        res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    } catch (error) {
        console.error('Error in getUser controller');
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updatedUser = await updateUserService(
            req.userId,
            req.body,
            req.file
        );
        res.status(200).json({
            success: true,
            data: {
                updatedUser,
            },
        });
    } catch (error) {
        console.error('Error in updateUser controller');
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await deleteUserService(req.userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
