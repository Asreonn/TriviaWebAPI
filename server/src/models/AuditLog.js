import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        resourceType: {
            type: String,
            required: true,
        },
        resourceId: {
            type: String,
            required: true,
        },
        description: String,
        metadata: {
            ipAddress: String,
            userAgent: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

auditLogSchema.index({ createdAt: -1 });

auditLogSchema.index({ resourceType: 1, resourceId: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
