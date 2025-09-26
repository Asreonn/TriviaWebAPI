import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        roles: {
            type: [String],
            default: ['admin'],
        },
        permissions: {
            type: [String],
            default: [],
        },
        lastLoginAt: Date,
        lastPasswordChangeAt: {
            type: Date,
            default: Date.now,
        },
        meta: {
            failedLoginAttempts: {
                type: Number,
                default: 0,
            },
            lockedUntil: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.passwordHash;
                ret.role = ret.roles?.[0] ?? 'admin';
            },
        },
    }
);

export const Admin = mongoose.model('Admin', adminSchema);
