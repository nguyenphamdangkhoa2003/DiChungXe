import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { getUser, updateUser, deleteUser } from './user.controller.js';
import validate from '../../middleware/validate.js';
import { updateUserSchema } from './user.validation.js';
import { storage } from '../../config/cloundinary.config.js';
import multer from 'multer';

const upload = multer({ storage }); 
const router = express.Router();

router.get('/me', verifyToken, getUser);
router.put(
    '/me',
    verifyToken,
    upload.single('profile_image'),
    validate(updateUserSchema),
    updateUser
);
router.delete('/me', verifyToken, deleteUser);
export default router;
