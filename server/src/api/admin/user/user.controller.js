import {
    getAllUsersService,
    getUserByIdService,
    createUserService,
    deleteUserService,
    changeUserRoleService,
    toggleUserStatusService,
    searchUsersService,
    getUsersByRoleService,
    exportUsersService,
} from './user.service.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersService(req.query);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await getUserByIdService(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const user = await createUserService(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await deleteUserService(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const changeUserRole = async (req, res) => {
    try {
        const user = await changeUserRoleService(req.params.id, req.body.role);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const user = await toggleUserStatusService(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const users = await searchUsersService(req.query);
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const users = await getUsersByRoleService(req.params.role, req.query);
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const exportUsers = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        const result = await exportUsersService(format);

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.send(result.data);
        } else {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=users_export.csv'
            );
            res.send(result.data);
        }
    } catch (error) {
        console.error('Export failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to export users',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined,
        });
    }
};
