import User from '../../../models/user.model.js';
import { json2csv } from 'json-2-csv';

// Lấy danh sách tất cả người dùng (có phân trang)
export const getAllUsersService = async (query) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        role = '',
    } = query;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build query conditions
    const conditions = {};
    if (search) {
        conditions.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ];
    }
    if (role) {
        conditions.role = role;
    }

    const [users, total] = await Promise.all([
        User.find(conditions).sort(sortOptions).skip(skip).limit(limit),
        User.countDocuments(conditions),
    ]);

    return {
        data: users,
        pagination: {
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit),
        },
    };
};

// Tìm kiếm người dùng (có phân trang)
export const searchUsersService = async (query) => {
    const { keyword, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const searchCondition = {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
            { phone: { $regex: keyword, $options: 'i' } },
        ],
    };

    const [users, total] = await Promise.all([
        User.find(searchCondition)
            .skip(skip)
            .limit(limit)
            .select('-password -__v'),
        User.countDocuments(searchCondition),
    ]);

    return {
        data: users,
        pagination: {
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit),
        },
    };
};

// Lấy danh sách người dùng theo vai trò (có phân trang)
export const getUsersByRoleService = async (role, query) => {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find({ role }).skip(skip).limit(limit).select('-password -__v'),
        User.countDocuments({ role }),
    ]);

    return {
        data: users,
        pagination: {
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit),
        },
    };
};

export const exportUsersService = async (format = 'csv') => {
    try {
        const users = await User.find()
            .select('-password -__v -refreshToken')
            .lean();

        if (!users.length) {
            throw new Error('No users found for export');
        }

        if (format === 'json') {
            return {
                data: JSON.stringify(users, null, 2),
                meta: {
                    exportedCount: users.length,
                    format,
                },
            };
        }

        const csv = await json2csv(users, {
            excludeKeys: ['_id', 'createdAt', 'updatedAt'],
            emptyFieldValue: '',
        });

        return {
            data: csv,
            meta: {
                exportedCount: users.length,
                format,
            },
        };
    } catch (error) {
        console.error('Export service error:', error);
        throw new Error(`Export failed: ${error.message}`);
    }
};

// Các hàm khác giữ nguyên
export const getUserByIdService = async (id) => {
    const user = await User.findById(id).select('-password -__v');
    if (!user) throw new Error('User not found');
    return { data: user };
};

export const createUserService = async (userData) => {
    const user = await User.create(userData);
    return { data: user };
};

export const deleteUserService = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error('User not found');
    return { data: user };
};

export const changeUserRoleService = async (id, role) => {
    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
    ).select('-password -__v');
    if (!user) throw new Error('User not found');
    return { data: user };
};

export const toggleUserStatusService = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return { data: user };
};
