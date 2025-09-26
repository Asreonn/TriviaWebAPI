import ms from 'ms';
import { AdminRepository } from '../repositories/adminRepository.js';
import { ApiError } from '../utils/ApiError.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyPassword,
} from './authService.js';
import { recordAuditEvent } from './auditService.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION = ms('15m');

export const authenticateAdmin = async ({ username, password, ip, userAgent }) => {
    const admin = await AdminRepository.findByUsername(username);

    if (!admin) {
        throw new ApiError(401, 'Invalid credentials');
    }

    if (!admin.isActive) {
        throw new ApiError(403, 'Administrator account is disabled');
    }

    const lockedUntil = admin.meta?.lockedUntil;
    if (lockedUntil && lockedUntil > new Date()) {
        throw new ApiError(423, 'Account temporarily locked due to failed login attempts');
    }

    const passwordMatches = await verifyPassword(password, admin.passwordHash);

    if (!passwordMatches) {
        const attempts = (admin.meta?.failedLoginAttempts ?? 0) + 1;
        const lockData = attempts >= MAX_FAILED_ATTEMPTS ? { lockedUntil: new Date(Date.now() + LOCK_DURATION) } : {};
        await AdminRepository.recordFailedLogin(admin.id, lockData);
        throw new ApiError(401, 'Invalid credentials');
    }

    const sanitizedAdmin = await AdminRepository.recordSuccessfulLogin(admin.id);

    const accessToken = generateAccessToken(sanitizedAdmin);
    const refreshToken = generateRefreshToken(sanitizedAdmin);

    await recordAuditEvent({
        actor: sanitizedAdmin.id,
        action: 'admin.login',
        resourceType: 'admin',
        resourceId: sanitizedAdmin.id,
        description: 'Administrator logged in',
        metadata: { ipAddress: ip, userAgent },
    });

    return {
        admin: sanitizedAdmin.toJSON(),
        tokens: {
            accessToken,
            refreshToken,
        },
    };
};

export const getAdminById = (id) => AdminRepository.findById(id);
