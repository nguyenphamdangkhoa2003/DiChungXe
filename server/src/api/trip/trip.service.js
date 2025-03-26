import Trip from '../../models/trip.model.js';
import User from '../../models/user.model.js';
import { AppError } from '../../utils/appError.js';

export const createTrip = async (tripData) => {
    const driver = await User.findById(tripData.driver_id);
    if (!driver || driver.role !== 'driver') {
        throw new AppError('Invalid driver ID or user is not a driver', 400);
    }

    if (!driver.isVerifiedDriver) {
        throw new AppError('Driver is not fully verified', 400);
    }

    const trip = await Trip.create(tripData);
    return trip;
};

export const getTripById = async (tripId) => {
    const trip = await Trip.findById(tripId)
        .populate('driver_id', 'name profile_image rating')
        .populate('passengers.passenger_id', 'name profile_image');

    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    return trip;
};

export const updateTrip = async (tripId, updateData, userId) => {
    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    if (!trip.driver_id.equals(userId)) {
        throw new AppError('Not authorized to update this trip', 403);
    }

    if (trip.status !== 'scheduled') {
        if (
            updateData.start_time ||
            updateData.available_seats ||
            updateData.price_per_seat
        ) {
            throw new AppError(
                'Cannot update trip details after it has started',
                400
            );
        }
    }

    Object.assign(trip, updateData);
    await trip.save();
    return trip;
};

export const addPassengerToTrip = async (tripId, passengerData) => {
    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }
    const passenger = await User.findById(passengerData.passenger_id);
    if (!passenger || passenger.role !== 'passenger') {
        throw new AppError(
            'Invalid passenger ID or user is not a passenger',
            400
        );
    }
    return trip.addPassenger(passengerData.passenger_id, passengerData.seats, {
        pickup_location: passengerData.pickup_location,
        dropoff_location: passengerData.dropoff_location,
    });
};

export const cancelPassengerFromTrip = async (tripId, passengerId) => {
    const trip = await Trip.findById(tripId);
    if (!trip) {
        throw new AppError('Trip not found', 404);
    }

    return trip.cancelPassenger(passengerId);
};

export const searchTrips = async (searchCriteria) => {
    const {
        start_location,
        end_location,
        start_time,
        max_price,
        seats_required,
    } = searchCriteria;

    const query = {
        status: 'scheduled',
        'start_location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: start_location,
                },
                $maxDistance: 5000,
            },
        },
        'end_location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: end_location,
                },
                $maxDistance: 5000,
            },
        },
        available_seats: { $gte: seats_required || 1 },
    };

    if (start_time) {
        query.start_time = {
            $gte: new Date(start_time.getTime() - 2 * 60 * 60 * 1000),
            $lte: new Date(start_time.getTime() + 2 * 60 * 60 * 1000),
        };
    }

    if (max_price) {
        query.price_per_seat = { $lte: max_price };
    }

    const trips = await Trip.find(query)
        .populate('driver_id', 'name profile_image rating')
        .sort({ start_time: 1 });

    return trips;
};

export const getDriverTrips = async (driverId, status) => {
    const query = { driver_id: driverId };
    if (status) {
        query.status = status;
    }

    return Trip.find(query)
        .populate('passengers.passenger_id', 'name profile_image')
        .sort({ start_time: -1 });
};

export const getPassengerTrips = async (passengerId, status) => {
    const query = { 'passengers.passenger_id': passengerId };
    if (status) {
        query.status = status;
    }

    return Trip.find(query)
        .populate('driver_id', 'name profile_image rating')
        .sort({ start_time: -1 });
};
