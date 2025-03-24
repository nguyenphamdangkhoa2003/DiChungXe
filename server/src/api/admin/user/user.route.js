import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    deleteUser,
    changeUserRole,
    toggleUserStatus,
    searchUsers,
    getUsersByRole,
    exportUsers,
} from './user.controller.js';

import { updateUser } from '../../user/user.controller.js';
import {
    changeRoleUserSchema,
    createUserSchema,
    updateUserSchema,
} from './user.validation.js';
import isAdmin from '../../../middleware/isAdmin.js';
import validate from '../../../middleware/validate.js';
import { verifyToken } from '../../../middleware/verifyToken.js';
import multer from 'multer';
import { storage } from '../../../config/cloundinary.config.js';

const upload = multer({ storage });
const router = express.Router();
router.get('/users/export', verifyToken, isAdmin, exportUsers);
router.get('/users/search', verifyToken, isAdmin, searchUsers);

router.get('/users', verifyToken, isAdmin, getAllUsers);

router.get('/users/role/:role', verifyToken, isAdmin, getUsersByRole);

router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.post(
    '/users',
    verifyToken,
    isAdmin,
    validate(createUserSchema),
    createUser
);
router.put(
    '/users/:id',
    verifyToken,
    isAdmin,
    validate(updateUserSchema),
    upload.single('profile_image'),
    updateUser
);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);
router.patch(
    '/users/:id/role',
    verifyToken,
    isAdmin,
    validate(changeRoleUserSchema),
    changeUserRole
);
router.patch('/users/:id/status', verifyToken, isAdmin, toggleUserStatus);

export default router;
