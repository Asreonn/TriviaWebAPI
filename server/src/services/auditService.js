import { AuditLog } from '../models/AuditLog.js';

export const recordAuditEvent = ({
    actor,
    action,
    resourceType,
    resourceId,
    description,
    metadata,
}) =>
    AuditLog.create({
        actor,
        action,
        resourceType,
        resourceId,
        description,
        metadata,
    });
