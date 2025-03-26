import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(
        /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/
    ),
    password: Joi.string().min(6).required(),
    role: Joi.string()
        .valid('driver', 'passenger', 'admin')
        .default('passenger'),
    profile_image: Joi.string().allow(''),
    date_of_birth: Joi.date(),
    gender: Joi.string().valid('male', 'female'),
    driver_info: Joi.object({
        car_plate: Joi.string().allow(''),
        car_model: Joi.string().allow(''),
        license_number: Joi.string().allow(''),
        seats: Joi.number().min(0),
    }).when('role', {
        is: 'driver',
        then: Joi.object({
            car_plate: Joi.string().required(),
            car_model: Joi.string().required(),
        }),
    }),
    subscription_status: Joi.string().valid('active', 'inactive'),
    current_plan: Joi.string().valid('basic', 'premium', 'vip'),
});

export const updateUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().pattern(
        /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/
    ),
    role: Joi.string().valid('driver', 'passenger', 'admin'),
    profile_image: Joi.string().allow(''),
    date_of_birth: Joi.date(),
    gender: Joi.string().valid('male', 'female'),
    driver_info: Joi.object({
        car_plate: Joi.string().allow(''),
        car_model: Joi.string().allow(''),
        license_number: Joi.string().allow(''),
        seats: Joi.number().min(0),
    }),
    subscription_status: Joi.string().valid('active', 'inactive'),
    current_plan: Joi.string().valid('basic', 'premium', 'vip'),
});

export const changeRoleUserSchema = Joi.object({
    role: Joi.string().valid('driver', 'passenger', 'admin'),
})