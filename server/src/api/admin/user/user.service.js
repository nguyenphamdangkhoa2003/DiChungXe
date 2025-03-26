import User from '../../../models/user.model.js';
import ExcelJS from 'exceljs';
import fs from 'fs';

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

export const exportUsersService = async (format = 'xlsx') => {
    try {
        const users = await User.find(); // Lấy dữ liệu từ MongoDB

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' },
            },
            alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
            },
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            },
        };

        const dataStyle = {
            font: { size: 11 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            border: {
                top: { style: 'thin', color: { argb: 'D9D9D9' } },
                left: { style: 'thin', color: { argb: 'D9D9D9' } },
                bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
                right: { style: 'thin', color: { argb: 'D9D9D9' } },
            },
        };

        const statusStyle = (isActive) => ({
            font: {
                color: { argb: isActive ? '00B050' : 'FF0000' },
                bold: true,
            },
        });

        worksheet.mergeCells('A1:H1');
        const titleRow = worksheet.getCell('A1');
        titleRow.value = 'DANH SÁCH NGƯỜI DÙNG HỆ THỐNG';
        titleRow.font = {
            size: 18,
            bold: true,
            color: { argb: 'FFFFFF' },
            name: 'Arial',
        };
        titleRow.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };
        titleRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '2F5597' },
        };

        worksheet.mergeCells('A2:H2');
        const dateRow = worksheet.getCell('A2');
        dateRow.value = `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`;
        dateRow.font = { italic: true };
        dateRow.alignment = { horizontal: 'right' };

        const headerRow = worksheet.addRow([
            'STT',
            'ID Người dùng',
            'Họ và tên',
            'Email',
            'Số điện thoại',
            'Vai trò',
            'Trạng thái',
            'Ngày đăng ký',
        ]);

        headerRow.eachCell((cell) => {
            Object.assign(cell, headerStyle);
        });

        users.forEach((user, index) => {
            const row = worksheet.addRow([
                index + 1,
                user._id.toString(),
                user.name,
                user.email,
                user.phone || 'N/A',
                user.role.toUpperCase(),
                user.isActive ? 'Hoạt động' : 'Không hoạt động',
                new Date(user.createdAt).toLocaleDateString('vi-VN'),
            ]);

            row.eachCell((cell) => {
                Object.assign(cell, dataStyle);
            });

            const statusCell = row.getCell(7);
            Object.assign(statusCell, statusStyle(user.isActive));
            statusCell.alignment = { horizontal: 'center' };

            const roleCell = row.getCell(6);
            roleCell.alignment = { horizontal: 'center' };

            const sttCell = row.getCell(1);
            sttCell.alignment = { horizontal: 'center' };
        });

        worksheet.columns = [
            { key: 'stt', width: 8 }, // STT
            { key: 'id', width: 28 }, // ID
            { key: 'name', width: 25 }, // Tên
            { key: 'email', width: 30 }, // Email
            { key: 'phone', width: 15 }, // SĐT
            { key: 'role', width: 15 }, // Vai trò
            { key: 'status', width: 15 }, // Trạng thái
            { key: 'createdAt', width: 15 }, // Ngày tạo
        ];

        const footerRow = worksheet.addRow([
            `Tổng số người dùng: ${users.length}`,
        ]);
        footerRow.getCell(1).font = { bold: true };
        worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);

        const lastRow = worksheet.lastRow.number;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
                // Bỏ qua 2 dòng tiêu đề
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: '000000' } },
                        left: { style: 'thin', color: { argb: '000000' } },
                        bottom: { style: 'thin', color: { argb: '000000' } },
                        right: { style: 'thin', color: { argb: '000000' } },
                    };
                });
            }
        });

        const filePath = 'users_export.xlsx';
        await workbook.xlsx.writeFile(filePath);

        return {
            data: fs.readFileSync(filePath),
            meta: {
                exportedCount: users.length,
                format,
                exportedAt: new Date().toISOString(),
            },
        };
    } catch (error) {
        throw new Error('Lỗi khi xuất dữ liệu người dùng: ' + error.message);
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
