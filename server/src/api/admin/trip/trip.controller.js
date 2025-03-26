import * as tripService from '../services/trip.service.js';
import { AppError } from '../utils/appError.js';

export const adminDeleteTrip = async (req, res, next) => {
    try {
        await tripService.deleteTrip(req.params.id, req.user.id, true);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
};
