import { AppError } from '../utils/appError.js';
import {
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
} from './emailTemplates.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const info = await transporter.sendMail({
            from: '"XeDiChung 👻" <noreply@xedichung.com>',
            to: email,
            subject: 'Verify your email ✔',
            html: VERIFICATION_EMAIL_TEMPLATE.replace(
                '{verificationCode}',
                verificationToken
            ),
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending verification', error);
        throw new AppError(`Error sending verification email: ${error}`, 500);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        const info = await transporter.sendMail({
            from: '"XeDiChung 👻" <noreply@xedichung.com>',
            to: email,
            subject: 'Verify your email ✔',
            html: WELCOME_EMAIL_TEMPLATE.replace('{name}', name),
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending welcome', error);
        throw new AppError(`Error sending welcome email: ${error}`, 500);
    }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const info = await transporter.sendMail({
            from: '"XeDiChung 👻" <noreply@xedichung.com>',
            to: email,
            subject: 'Reset your password ✔',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
                '{resetURL}',
                resetUrl
            ),
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending password reset email', error);
        throw new AppError(`Error sending password reset email: ${error}`, 500);
    }
};

export const sendResetSuccessEmail = async (email) => {
    try {
        const info = await transporter.sendMail({
            from: '"XeDiChung 👻" <noreply@xedichung.com>',
            to: email,
            subject: 'Password Reset Successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending password reset success email', error);
        throw new AppError(`Error sending password reset success email: ${error}`, 500);
    }
};
