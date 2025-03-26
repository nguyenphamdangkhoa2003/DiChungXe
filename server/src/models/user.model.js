import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Full name is required.'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email address is required.'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Invalid email address.',
            ],
            index: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            match: [
                /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/,
                'Invalid phone number.',
            ],
        },
        password: {
            type: String,
            select: false,
            minlength: [8, 'Password must be at least 8 characters'],
        },
        role: {
            type: String,
            enum: ['driver', 'passenger', 'admin'],
            default: 'passenger',
            index: true,
        },
        profile_image: {
            type: String,
            default: '',
            validate: {
                validator: (v) => !v || v.startsWith('https://'),
                message: 'Profile image must be a valid URL',
            },
        },
        verified: {
            email: { type: Boolean, default: false },
            phone: { type: Boolean, default: false },
            identity: { type: Boolean, default: false },
        },
        driver_info: {
            car_plate: {
                type: String,
                uppercase: true,
                trim: true,
                validate: {
                    validator: function (v) {
                        return !v || /^[A-Z0-9]{3,12}$/.test(v);
                    },
                    message: 'Invalid license plate',
                },
            },
            car_model: {
                type: String,
                trim: true,
                maxlength: [50, 'Car model cannot exceed 50 characters'],
            },
            license_number: {
                type: String,
                trim: true,
                uppercase: true,
            },
            seats: {
                type: Number,
                min: [1, 'At least 1 seat'],
                max: [16, 'Maximum 16 seats'],
                default: 4,
            },
            car_images: {
                type: [String],
                validate: {
                    validator: (v) =>
                        !v || v.every((img) => img.startsWith('https://')),
                    message: 'Car images must be valid URLs',
                },
            },
        },
        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
                set: (v) => parseFloat(v.toFixed(1)),
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        date_of_birth: {
            type: Date,
            validate: {
                validator: function (v) {
                    return (
                        !v ||
                        v <
                            new Date(
                                new Date().setFullYear(
                                    new Date().getFullYear() - 18
                                )
                            )
                    );
                },
                message: 'User must be at least 18 years old',
            },
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
            enum: ['male', 'female', 'other'],
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        last_active: {
            type: Date,
            default: Date.now,
        },
        fcm_token: {
            type: String,
            select: false,
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpiresAt: {
            type: Date,
            select: false,
        },
        verificationToken: {
            type: String,
            select: false,
        },
        verificationTokenExpiresAt: {
            type: Date,
            select: false,
        },
        google_id: {
            type: String,
            select: false,
            index: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtuals
userSchema.virtual('isVerifiedDriver').get(function () {
    return (
        this.role === 'driver' &&
        this.verified.email &&
        this.verified.phone &&
        this.verified.identity
    );
});

userSchema.virtual('profile_completion').get(function () {
    let completion = 0;
    const requiredFields = ['name', 'email', 'phone'];

    requiredFields.forEach((field) => {
        if (this[field]) completion += 20;
    });

    if (this.profile_image) completion += 10;
    if (this.date_of_birth) completion += 10;
    if (this.gender) completion += 10;

    if (this.role === 'driver') {
        if (this.driver_info?.car_plate) completion += 10;
        if (this.driver_info?.license_number) completion += 10;
        if (this.driver_info?.car_images?.length > 0) completion += 10;
    }

    return Math.min(100, completion);
});

// Indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index(
    { 'driver_info.car_plate': 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: {
            role: 'driver',
            'driver_info.car_plate': { $exists: true },
        },
    }
);
userSchema.index({ name: 'text', email: 'text' });

// Methods
userSchema.methods.addRating = async function (newRating) {
    if (newRating < 0 || newRating > 5) {
        throw new AppError('Rating must be between 0 and 5');
    }

    this.rating = this.rating || { average: 0, count: 0 };
    const total = this.rating.average * this.rating.count + newRating;
    this.rating.count += 1;
    this.rating.average = total / this.rating.count;

    await this.save();
    return this.rating;
};

userSchema.methods.getPublicProfile = function () {
    const userObject = this.toObject();
    const privateFields = [
        'password',
        'isDeleted',
        'resetPasswordToken',
        'resetPasswordExpiresAt',
        'verificationToken',
        'verificationTokenExpiresAt',
        'fcm_token',
    ];

    privateFields.forEach((field) => delete userObject[field]);
    return userObject;
};

// Hooks
userSchema.pre('save', function (next) {
    if (this.role !== 'driver') {
        this.driver_info = undefined;
    }

    next();
});

userSchema.pre(/^find/, function (next) {
    if (this.options._recursed) {
        return next();
    }

    this.find({ isDeleted: { $ne: true } });
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
