export class ApiError extends Error {
    constructor(statusCode, message, errors = [], isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
