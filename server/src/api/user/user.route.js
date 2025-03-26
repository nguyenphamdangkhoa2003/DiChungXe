import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { getUser, updateUser, deleteUser } from './user.controller.js';
import validate from '../../middleware/validate.middleware.js';
import { updateUserSchema } from './user.validation.js';
import { storage } from '../../config/cloundinary.config.js';
import multer from 'multer';

const upload = multer({ storage });
const router = express.Router();

router.get('/me', protect, getUser);
router.put(
    '/me',
    protect,
    upload.single('profile_image'),
    validate(updateUserSchema),
    updateUser
);
router.delete('/me', protect, deleteUser);
export default router;
