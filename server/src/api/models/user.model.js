// models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên đầy đủ của người dùng là bắt buộc.'],
        },
        email: {
            type: String,
            required: [true, 'Địa chỉ email là bắt buộc.'],
            unique: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Địa chỉ email không hợp lệ.',
            ],
        },
        phone: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc.'],
            unique: true,
            match: [
                /^\+?[0-9]{1,4}[-\s]?[0-9]{2,4}[-\s]?[0-9]{6,8}$/,
                'Số điện thoại không hợp lệ.',
            ],
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc.'],
            select: false,
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt.',
            ],
        },
        role: {
            type: String,
            required: [true, 'Vai trò là bắt buộc.'],
            enum: ['driver', 'passenger', 'admin'],
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
            default: [false, false], // [phone, email]
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
            min: [0, 'Đánh giá không được nhỏ hơn 0.'],
            max: [5, 'Đánh giá không được lớn hơn 5.'],
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
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);
