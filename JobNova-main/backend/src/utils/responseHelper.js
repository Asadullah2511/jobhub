const success = (res, data, message = null, meta = null) => {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };

    if (message) response.message = message;
    if (meta) response.meta = meta;

    return res.status(200).json(response);
};

const created = (res, data, message = 'Resource created successfully') => {
    return res.status(201).json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });
};

const noContent = (res) => {
    return res.status(204).send();
};

const error = (res, message, statusCode = 400, errorCode = null, details = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (errorCode) response.errorCode = errorCode;
    if (details) response.details = details;

    return res.status(statusCode).json(response);
};

const badRequest = (res, message = 'Bad request', details = null) => {
    return error(res, message, 400, 'BAD_REQUEST', details);
};

const unauthorized = (res, message = 'Unauthorized access') => {
    return error(res, message, 401, 'UNAUTHORIZED');
};

const forbidden = (res, message = 'Access forbidden') => {
    return error(res, message, 403, 'FORBIDDEN');
};

const notFound = (res, message = 'Resource not found') => {
    return error(res, message, 404, 'NOT_FOUND');
};

const conflict = (res, message = 'Resource conflict') => {
    return error(res, message, 409, 'CONFLICT');
};

const validationError = (res, errors) => {
    return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        errors,
        timestamp: new Date().toISOString()
    });
};

const serverError = (res, message = 'Internal server error') => {
    return error(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

const paginated = (res, data, pagination, message = null) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
            hasPrev: pagination.page > 1
        },
        message,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    success,
    created,
    noContent,
    error,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    validationError,
    serverError,
    paginated,
    fail: error
};