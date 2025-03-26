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
import validate from '../../../middleware/validate.middleware.js';
import { protect } from '../../../middleware/auth.middleware.js';
import { storage } from '../../../config/cloundinary.config.js';
import multer from 'multer';

const upload = multer({ storage });
const router = express.Router();
router.use(protect);

router.get('/users/export', exportUsers);
router.get('/users/search', searchUsers);

router.get('/users', getAllUsers);

router.get('/users/role/:role', getUsersByRole);

router.get('/users/:id', getUserById);
router.post('/users', validate(createUserSchema), createUser);
router.put(
    '/users/:id',
    validate(updateUserSchema),
    upload.single('profile_image'),
    updateUser
);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', validate(changeRoleUserSchema), changeUserRole);
router.patch('/users/:id/status', toggleUserStatus);

export default router;
