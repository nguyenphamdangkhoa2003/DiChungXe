import { AppError } from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token) {
            return next(
                new AppError(
                    'You are not logged in! Please log in to get access.',
                    401
                )
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next(
                new AppError(
                    'The user belonging to this token does no longer exist.',
                    401
                )
            );
        }

        if (!currentUser.isActive) {
            return next(
                new AppError('Your account has been deactivated.', 403)
            );
        }

        req.user = currentUser;
        next();
    } catch (err) {
        next(err);
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};

// Middleware đặc biệt cho driver
export const driverOnly = restrictTo('driver');

// Middleware đặc biệt cho passenger
export const passengerOnly = restrictTo('passenger');

// Middleware đặc biệt cho admin
export const adminOnly = restrictTo('admin');
