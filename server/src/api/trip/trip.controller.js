import * as tripService from './trip.service.js';
import {
    createTripValidation,
    updateTripValidation,
    addPassengerValidation,
    searchTripsValidation,
} from './trip.validation.js';
import { AppError } from '../../utils/appError.js';

// Driver Controllers
export const createTrip = async (req, res, next) => {
    try {
        const { error } = createTripValidation.validate(req.body);
        if (error) throw new AppError(error.details[0].message, 400);

        const trip = await tripService.createTrip({
            ...req.body,
            driver_id: req.user.id,
        });

        res.status(201).json({
            status: 'success',
            data: trip,
        });
    } catch (err) {
        next(err);
    }
};

export const updateTrip = async (req, res, next) => {
    try {
        const { error } = updateTripValidation.validate(req.body);
        if (error) throw new AppError(error.details[0].message, 400);

        const trip = await tripService.updateTrip(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json({
            status: 'success',
            data: trip,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteTrip = async (req, res, next) => {
    try {
        await tripService.deleteTrip(req.params.id, req.user.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
};

export const getDriverTrips = async (req, res, next) => {
    try {
        const trips = await tripService.getDriverTrips(
            req.user.id,
            req.query.status
        );
        res.json({
            status: 'success',
            results: trips.length,
            data: trips,
        });
    } catch (err) {
        next(err);
    }
};

// Passenger Controllers
export const addPassenger = async (req, res, next) => {
    try {
        const { error } = addPassengerValidation.validate(req.body);
        if (error) throw new AppError(error.details[0].message, 400);
        const trip = await tripService.addPassengerToTrip(req.params.id, {
            ...req.body,
            passenger_id: req.user.id,
        });
        res.status(201).json({
            status: 'success',
            data: trip,
        });
    } catch (err) {
        next(err);
    }
};

export const cancelPassenger = async (req, res, next) => {
    try {
        const trip = await tripService.cancelPassengerFromTrip(
            req.params.id,
            req.user.id
        );

        res.json({
            status: 'success',
            data: trip,
        });
    } catch (err) {
        next(err);
    }
};

export const getPassengerTrips = async (req, res, next) => {
    try {
        const trips = await tripService.getPassengerTrips(
            req.user.id,
            req.query.status
        );
        res.json({
            status: 'success',
            results: trips.length,
            data: trips,
        });
    } catch (err) {
        next(err);
    }
};

// Shared Controllers
export const getTrip = async (req, res, next) => {
    try {
        const trip = await tripService.getTripById(req.params.id);
        res.json({
            status: 'success',
            data: trip,
        });
    } catch (err) {
        next(err);
    }
};

export const searchTrips = async (req, res, next) => {
    try {
        const { error } = searchTripsValidation.validate(req.query);
        if (error) throw new AppError(error.details[0].message, 400);

        const trips = await tripService.searchTrips({
            start_location: req.query.start_location,
            end_location: req.query.end_location,
            start_time: req.query.start_time
                ? new Date(req.query.start_time)
                : null,
            max_price: req.query.max_price ? Number(req.query.max_price) : null,
            seats_required: req.query.seats_required
                ? Number(req.query.seats_required)
                : null,
        });

        res.json({
            status: 'success',
            results: trips.length,
            data: trips,
        });
    } catch (err) {
        next(err);
    }
};

export const getMyTrips = async (req, res, next) => {
    try {
        let trips;
        if (req.user.role === 'driver') {
            trips = await tripService.getDriverTrips(
                req.user.id,
                req.query.status
            );
        } else {
            trips = await tripService.getPassengerTrips(
                req.user.id,
                req.query.status
            );
        }

        res.json({
            status: 'success',
            results: trips.length,
            data: trips,
        });
    } catch (err) {
        next(err);
    }
};
