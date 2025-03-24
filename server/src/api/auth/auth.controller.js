import {
    registerUser,
    loginUser,
    verifyEmailUser,
    forgotPasswordUser,
    resetPasswordUser,
    checkAuthUser,
    completeProfileUser,
} from './auth.service.js';

export const register = async (req, res) => {
    try {
        const { user, token } = await registerUser(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 giờ
        });

        res.status(201).json({
            success: true,
            data: { user, token },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { user, token } = await loginUser(req.body);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            data: { user, token },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { user } = await verifyEmailUser(req.body.code);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { message } = await forgotPasswordUser(req.body.email);
        res.status(200).json({
            success: true,
            message,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { message } = await resetPasswordUser(req.params.token, req.body.password);
        res.status(200).json({
            success: true,
            message,
        });
    } catch (error) {
        next(error);
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const { user } = await checkAuthUser(req.userId);
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const completeProfile = async (req, res, next) => {
    try {
        const { user } = await completeProfileUser(req.user._id, req.body);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};