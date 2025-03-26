import express from 'express';
import passport from '../../config/passport.config.js';

import {
    register,
    login,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    completeProfile,
} from './auth.controller.js';
import {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    completeProfileSchema,
} from './auth.validation.js';
import validate from '../../middleware/validate.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';
const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post(
    '/reset-password/:token',
    validate(updatePasswordSchema),
    resetPassword
);

router.get('/check-auth', protect, checkAuth);

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        if (!req.user.phone || !req.user.role) {
            return res.redirect('/complete-profile');
        }
        res.redirect('/dashboard');
    }
);

router.post(
    '/complete-profile',
    validate(completeProfileSchema),
    completeProfile
);
export default router;
