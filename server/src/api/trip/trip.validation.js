import Joi from 'joi';
import { TripStatus } from './trip.constants.js';

// Base validation messages
const defaultMessages = {
    'any.required': '{{#label}} is required',
    'string.empty': '{{#label}} cannot be empty',
    'number.base': '{{#label}} must be a number',
    'number.min': '{{#label}} must be at least {{#limit}}',
    'number.max': '{{#label}} must be less than or equal to {{#limit}}',
    'date.greater': '{{#label}} must be in the future',
    'string.hex': '{{#label}} must be a valid hexadecimal',
    'string.length': '{{#label}} must be {{#limit}} characters long',
};

// Location schema
const locationSchema = Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    address: Joi.string().required(),
}).messages(defaultMessages);

// DRIVER VALIDATIONS
export const createTripValidation = Joi.object({
    start_location: locationSchema.required(),
    end_location: locationSchema.required(),
    start_time: Joi.date().greater('now').required(),
    available_seats: Joi.number().integer().min(1).max(16).required(),
    price_per_seat: Joi.number().min(0).max(10000000).required(),
    distance: Joi.object({
        value: Joi.number().required(),
        text: Joi.string().required(),
    }).required(),
    duration: Joi.object({
        value: Joi.number().required(),
        text: Joi.string().required(),
    }).required(),
}).messages(defaultMessages);

export const updateTripValidation = Joi.object({
    start_time: Joi.date().greater('now').optional(),
    available_seats: Joi.number().integer().min(1).max(16).optional(),
    price_per_seat: Joi.number().min(0).max(10000000).optional(),
    status: Joi.string()
        .valid(...Object.values(TripStatus))
        .optional(),
})
    .min(1)
    .messages({
        ...defaultMessages,
        'object.min': 'At least one field must be provided',
    });

// PASSENGER VALIDATIONS
export const addPassengerValidation = Joi.object({
    seats: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required()
        .messages({
            ...defaultMessages,
            'number.max': 'Maximum {{#limit}} seats per booking',
        }),
    pickup_location: locationSchema.optional(),
    dropoff_location: locationSchema.optional(),
}).messages(defaultMessages);

export const cancelPassengerValidation = Joi.object({
    tripId: Joi.string().hex().length(24).required(),
}).messages(defaultMessages);

// SEARCH VALIDATION
export const searchTripsValidation = Joi.object({
    start_lng: Joi.number().min(-180).max(180).required(),
    start_lat: Joi.number().min(-90).max(90).required(),
    end_lng: Joi.number().min(-180).max(180).required(),
    end_lat: Joi.number().min(-90).max(90).required(),
    start_time: Joi.date().greater('now').optional(),
    max_price: Joi.number().min(0).optional(),
    seats_required: Joi.number().integer().min(1).optional(),
}).messages(defaultMessages);

// ID VALIDATIONS
export const tripIdValidation = Joi.object({
    id: Joi.string().hex().length(24).required(),
}).messages(defaultMessages);
