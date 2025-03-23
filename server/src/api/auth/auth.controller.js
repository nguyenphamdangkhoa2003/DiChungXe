import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppError } from '../../utils/appError.js';
import { generateVerificationToken } from '../../utils/generateVerificationToken.js';
import { generateTokenAndSetCookie } from '../../utils/generateTokenAndSetCookie.js';
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail,
} from '../../Mail/emails.js';

export const register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, date_of_birth, gender } =
            req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            console.log('existingUser', existingUser);
            throw new AppError('Email or phone number already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = generateVerificationToken();
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            date_of_birth,
            gender,
            verified: [false, false],
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60,
        });
        await sendVerificationEmail(user.email, verificationToken);
        const token = generateTokenAndSetCookie(res, user._id);

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            token,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;

        // Find user by email or phone
        const user = await User.findOne({
            $or: [{ email }, { phone }],
        }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new AppError('Invalid login credentials', 401);
        }

        // Generate JWT
        const token = generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            status: 'success',
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { code } = req.body;
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code',
            });
        }

        user.verified[0] = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();
        sendWelcomeEmail(user.email, user.name);
        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user,
            },
        });
    } catch (error) {
        console.error('Error in email verification');
    }
};

export const logout = async (req, res, next) => {
    res.clearCookie('token');
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({
            email,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpireAt;

        await user.save();

        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/api/v1/auth/reset-password/${resetToken}`
        );

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email',
        });
    } catch (error) {
        console.error('Error in forgotPassword: \n', error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {
                $gt: Date.now(),
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Update password
        const hash_password = await bcrypt.hash(password, 10);

        user.password = hash_password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();
        await sendResetSuccessEmail(user.email);

        return res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log('Error in checkAuth', error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const completeProfile = async (req, res, next) => {
    const { phone, gender, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.findById(req.user._id);
        user.phone = phone;
        user.gender = gender;
        user.password = hashedPassword;

        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user,
            },
        });
    } catch (error) {
        console.error('Error in completeProfile: ', error);
        return res.status(400).json({ message: error.message, success: false });
    }
};