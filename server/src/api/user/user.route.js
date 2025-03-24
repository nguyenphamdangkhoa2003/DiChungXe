import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { getUser, updateUser, deleteUser } from './user.controller.js';
import validate from '../../middleware/validate.js';
import { updateUserSchema } from './user.validation.js';
import { storage } from '../../config/cloundinary.config.js';
import multer from 'multer';

const upload = multer({ storage }); 
const route = express.Router();

route.get('/me', verifyToken, getUser);
route.put(
    '/me',
    verifyToken,
    upload.single('profile_image'),
    validate(updateUserSchema),
    updateUser
);
route.delete('/me', verifyToken, deleteUser);
export default route;
