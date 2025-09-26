import { ApiError } from '../utils/ApiError.js';

const evaluatePermissions = (userPermissions, permissions, match) => {
    if (match === 'any') {
        return permissions.some((permission) => userPermissions.includes(permission));
    }

    return permissions.every((permission) => userPermissions.includes(permission));
};

const guard = (permissions, options = { match: 'all' }) => (req, res, next) => {
    const userPermissions = req.user?.permissions ?? [];

    if (!evaluatePermissions(userPermissions, permissions, options.match)) {
        return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
};

export const requirePermission = (...permissions) => guard(permissions);

export const requireAnyPermission = (...permissions) => guard(permissions, { match: 'any' });
