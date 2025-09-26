import { Admin } from '../models/Admin.js';

export const AdminRepository = {
    findByUsername: (username) =>
        Admin.findOne({ username: username.toLowerCase() }),

    findById: (id) => Admin.findById(id),

    create: (adminData) => Admin.create(adminData),

    recordSuccessfulLogin: (adminId) =>
        Admin.findByIdAndUpdate(
            adminId,
            {
                lastLoginAt: new Date(),
                'meta.failedLoginAttempts': 0,
                'meta.lockedUntil': null,
            },
            { new: true }
        ),

    recordFailedLogin: (adminId, attempt) =>
        Admin.findByIdAndUpdate(adminId, {
            $inc: { 'meta.failedLoginAttempts': 1 },
            $set: {
                'meta.lockedUntil': attempt.lockedUntil ?? null,
            },
        }),

    updatePermissions: (adminId, permissions) =>
        Admin.findByIdAndUpdate(
            adminId,
            { permissions },
            { new: true }
        ),

    updateAttributes: (adminId, attributes) =>
        Admin.findByIdAndUpdate(
            adminId,
            attributes,
            { new: true }
        ),
};
