// api/auth/auth.validation.js
import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Full name is required.',
    }),
    email: Joi.string()
        .email()
        .required()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .messages({
            'any.required': 'Email address is required.',
            'string.email': 'Invalid email address.',
            'string.pattern.base': 'Invalid email address.',
        }),
    phone: Joi.string()
        .required()
        .pattern(/^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/)
        .messages({
            'any.required': 'Phone number is required.',
            'string.pattern.base': 'Invalid phone number.',
        }),
    password: Joi.string()
        .required()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
            'any.required': 'Password is required.',
            'string.pattern.base':
                'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
        }),
    role: Joi.string().valid('driver', 'passenger').required().messages({
        'any.required': 'Role is required.',
        'any.only': 'Invalid role.',
    }),
    date_of_birth: Joi.date(),
    gender: Joi.string().valid('male', 'female').messages({
        'any.required': 'Gender is required.',
        'any.only': 'Invalid gender.',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(
        /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/
    ),
    password: Joi.string().required(),
}).xor('email', 'phone');

export const updatePasswordSchema = Joi.object({
    password: Joi.string()
        .required()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
            'any.required': 'Password is required.',
            'string.pattern.base':
                'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
        }),
});
export const completeProfileSchema = Joi.object({
    phone: Joi.string()
        .required()
        .pattern(/^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/)
        .messages({
            'any.required': 'Phone number is required.',
            'string.pattern.base': 'Invalid phone number.',
        }),
    gender: Joi.string().valid('male', 'female').required().messages({
        'any.required': 'Gender is required.',
        'any.only': 'Gender must be either "male" or "female".',
    }),
    password: Joi.string()
        .required()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
            'any.required': 'Password is required.',
            'string.pattern.base':
                'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
        }),
});
