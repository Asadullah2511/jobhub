const rateLimit = require('express-rate-limit');

// Global rate limiter: 100 requests per minute per IP
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

// Strict rate limiter for auth endpoints: 5 requests per minute per IP
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many login/register attempts, please try again later.' }
});

// Moderate rate limiter for general API v1: 60 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

module.exports = { globalLimiter, authLimiter, apiLimiter };