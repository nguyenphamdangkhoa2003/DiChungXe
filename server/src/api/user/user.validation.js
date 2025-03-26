import Joi from 'joi';

export const updateUserSchema = Joi.object({
    name: Joi.string(),
    phone: Joi.string().pattern(
        /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/
    ),
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
        }).required(),
    }),
});
