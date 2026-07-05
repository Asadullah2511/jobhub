class AppError extends Error {
    constructor(message, statusCode, errorCode = null, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 422, 'VALIDATION_ERROR');
        this.details = details;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400, 'BAD_REQUEST');
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500, 'DATABASE_ERROR', false);
        this.originalError = originalError;
    }
}

class ExternalServiceError extends AppError {
    constructor(message = 'External service error', service = null) {
        super(message, 503, 'SERVICE_UNAVAILABLE', false);
        this.service = service;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    BadRequestError,
    DatabaseError,
    ExternalServiceError
};
