import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';
const Schema = mongoose.Schema;

const locationSchema = new Schema(
    {
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (v) {
                    return (
                        v.length === 2 &&
                        typeof v[0] === 'number' &&
                        typeof v[1] === 'number'
                    );
                },
                message: (props) =>
                    `${props.value} is not a valid coordinates array [longitude, latitude]`,
            },
        },
        address: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const distanceSchema = new Schema(
    {
        value: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const durationSchema = new Schema(
    {
        value: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const stepSchema = new Schema(
    {
        instruction: {
            type: String,
            required: true,
        },
        distance: {
            type: distanceSchema,
            required: true,
        },
        start_location: {
            type: [Number],
            required: true,
            validate: {
                validator: function (v) {
                    return (
                        v.length === 2 &&
                        typeof v[0] === 'number' &&
                        typeof v[1] === 'number'
                    );
                },
                message: (props) =>
                    `${props.value} is not a valid coordinates array [longitude, latitude]`,
            },
        },
        end_location: {
            type: [Number],
            required: true,
            validate: {
                validator: function (v) {
                    return (
                        v.length === 2 &&
                        typeof v[0] === 'number' &&
                        typeof v[1] === 'number'
                    );
                },
                message: (props) =>
                    `${props.value} is not a valid coordinates array [longitude, latitude]`,
            },
        },
    },
    { _id: false }
);

const passengerInfoSchema = new Schema(
    {
        status: {
            type: String,
            enum: ['confirmed', 'cancelled'],
            default: 'confirmed',
            required: true,
        },
        seats: {
            type: Number,
            min: 1,
            required: true,
        },
        passenger_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: async function (v) {
                    const user = await mongoose.model('User').findById(v);
                    return user && user.role === 'passenger';
                },
                message: 'Passenger ID must reference a valid passenger user',
            },
        },
        pickup_location: {
            type: locationSchema,
            required: false, 
        },
        dropoff_location: {
            type: locationSchema,
            required: false, 
        },
    },
    { _id: false }
);

const tripSchema = new Schema(
    {
        driver_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: async function (v) {
                    const user = await mongoose.model('User').findById(v);
                    return user && user.role === 'driver';
                },
                message: 'Driver ID must reference a valid driver user',
            },
        },
        start_location: {
            type: locationSchema,
            required: true,
        },
        end_location: {
            type: locationSchema,
            required: true,
        },
        start_time: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    return v > new Date();
                },
                message: (props) => `Start time must be in the future`,
            },
        },
        available_seats: {
            type: Number,
            min: 1,
            required: true,
        },
        price_per_seat: {
            type: Number,
            min: 0,
            required: true,
        },
        status: {
            type: String,
            enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
            default: 'scheduled',
        },
        passengers: {
            type: [passengerInfoSchema],
            default: [],
        },
        distance: {
            type: distanceSchema,
            required: true,
        },
        duration: {
            type: durationSchema,
            required: true,
        },
        steps: {
            type: [stepSchema],
            required: true,
        },
        vehicle_info: {
            type: {
                car_plate: String,
                car_model: String,
                seats: Number,
            },
            required: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
tripSchema.index({ 'start_location.coordinates': '2dsphere' });
tripSchema.index({ 'end_location.coordinates': '2dsphere' });
tripSchema.index({ start_time: 1 });
tripSchema.index({ status: 1 });

// Virtuals
tripSchema.virtual('total_seats').get(function () {
    return this.vehicle_info?.seats || this.driver_info?.seats || 4; // Default value
});

tripSchema.virtual('booked_seats').get(function () {
    return this.passengers.reduce(
        (sum, p) => (p.status === 'confirmed' ? sum + p.seats : sum),
        0
    );
});

tripSchema.virtual('is_full').get(function () {
    return this.booked_seats >= this.total_seats;
});

// Pre-save hooks
tripSchema.pre('save', async function (next) {
    if (this.isModified('driver_id')) {
        const driver = await mongoose.model('User').findById(this.driver_id);
        if (driver && driver.driver_info) {
            this.vehicle_info = {
                car_plate: driver.driver_info.car_plate,
                car_model: driver.driver_info.car_model,
                seats: driver.driver_info.seats,
            };
        }
    }
    next();
});

// Methods
tripSchema.methods.addPassenger = async function (
    passengerId,
    seats,
    options = {}
) {
    try {
        if (this.status !== 'scheduled') {
            throw new AppError('Cannot add passenger to non-scheduled trip');
        }

        if (this.booked_seats + seats > this.total_seats) {
            throw new AppError('Not enough available seats');
        }

        const passengerData = {
            passenger_id: passengerId,
            seats: seats,
            status: 'confirmed',
            ...options,
        };
        this.passengers.push(passengerData);
        const res = await this.save();
        return res;
        return;
    } catch (error) {
        console.log(error);
        throw new AppError('Trin.addPassenger error: ', error.message);
    }
};

tripSchema.methods.cancelPassenger = async function (passengerId) {
    const passenger = this.passengers.find(
        (p) => p.passenger_id.equals(passengerId) && p.status === 'confirmed'
    );

    if (!passenger) {
        throw new AppError('Passenger not found or already cancelled');
    }

    passenger.status = 'cancelled';
    return this.save();
};

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
