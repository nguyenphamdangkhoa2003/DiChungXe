// Trip status constants
export const TripStatus = {
    SCHEDULED: 'scheduled',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DELETED: 'deleted',
};

// Passenger status constants
export const PassengerStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
};

// Trip sort options
export const TripSortBy = {
    PRICE: 'price',
    DEPARTURE_TIME: 'departure_time',
    CREATED_AT: 'created_at',
    DISTANCE: 'distance',
};

// Trip filter constants
export const TripFilter = {
    UPCOMING: 'upcoming',
    PAST: 'past',
    TODAY: 'today',
};

// Default values
export const TripDefaults = {
    MAX_SEATS: 16,
    MAX_PRICE: 10000000, // 10 million VND
    SEARCH_RADIUS: 5000, // 5km in meters
};

// Error messages
export const TripErrorMessages = {
    NOT_FOUND: 'Trip not found',
    DRIVER_REQUIRED: 'Driver is required',
    INVALID_STATUS: 'Invalid trip status',
    SEAT_UNAVAILABLE: 'Not enough available seats',
    TRIP_COMPLETED: 'Trip is already completed',
    TRIP_CANCELLED: 'Trip is cancelled',
    TRIP_DELETED: 'Trip is deleted',
    PASSENGER_EXISTS: 'Passenger already exists in this trip',
};
