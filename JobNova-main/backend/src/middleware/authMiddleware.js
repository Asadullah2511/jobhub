const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next(new AuthenticationError('No token provided'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return next(new AuthenticationError('Token has expired'));
        }
        return next(new AuthenticationError('Invalid token'));
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return next(new AuthorizationError('Access denied. Admin only.'));
};

const requireRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Authentication required'));
        }

        if (roles.includes(req.user.role)) {
            return next();
        }

        return next(new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`));
    };
};

module.exports = {
    authenticateUser: authMiddleware,
    requireAdmin,
    requireRoles
};
