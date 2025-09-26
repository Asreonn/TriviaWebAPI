import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

const basePayload = (admin) => ({
    id: admin.id || admin._id,
    username: admin.username,
    permissions: admin.permissions,
    roles: admin.roles,
    displayName: admin.displayName,
});

export const generateAccessToken = (admin) =>
    jwt.sign(basePayload(admin), config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiresIn,
    });

export const generateRefreshToken = (admin) =>
    jwt.sign(basePayload(admin), config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
    });

export const verifyRefreshToken = (token) =>
    jwt.verify(token, config.jwt.refreshSecret);
