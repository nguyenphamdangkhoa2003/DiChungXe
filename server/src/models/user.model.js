import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Full name is required.'],
        },
        email: {
            type: String,
            required: [true, 'Email address is required.'],
            unique: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Invalid email address.',
            ],
        },
        phone: {
            type: String,
            unique: true,
            match: [
                /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/,
                'Invalid phone number.',
            ],
        },
        password: {
            type: String,
            select: false,
        },
        role: {
            type: String,
            enum: ['driver', 'passenger', 'admin'],
            default: 'passenger',
        },
        profile_image: {
            type: String,
            default: '',
        },
        verified: {
            type: [
                {
                    type: Boolean,
                    default: false,
                },
            ],
            default: [false, false],
        },
        driver_info: {
            car_plate: {
                type: String,
                default: '',
            },
            car_model: {
                type: String,
                default: '',
            },
            license_number: {
                type: String,
                default: '',
            },
            seats: {
                type: Number,
                default: 0,
            },
        },
        rating: {
            type: Number,
            min: [0, 'Rating cannot be less than 0.'],
            max: [5, 'Rating cannot be greater than 5.'],
            default: 0,
        },
        date_of_birth: {
            type: Date,
        },
        subscription_status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
        },
        current_plan: {
            type: String,
            enum: ['basic', 'premium', 'vip'],
            default: 'basic',
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },

        resetPasswordToken: String,
        resetPasswordExpiresAt: Date,
        verificationToken: String,
        verificationTokenExpiresAt: Date,
        google_id: String,
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);