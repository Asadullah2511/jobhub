const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof AppError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        error = new AppError(message, statusCode, null, false);
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';

    const response = {
        success: false,
        message: error.message,
        errorCode: error.errorCode,
        timestamp: new Date().toISOString()
    };

    if (error.details) {
        response.details = error.details;
    }

    if (isDevelopment) {
        response.stack = error.stack;
        if (error.originalError) {
            response.originalError = error.originalError.message;
        }
    }

    if (!error.isOperational) {
        console.error('NON-OPERATIONAL ERROR:', {
            message: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            user: req.user?.id
        });
    }

    res.status(error.statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        errorCode: 'ROUTE_NOT_FOUND',
        timestamp: new Date().toISOString()
    });
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
