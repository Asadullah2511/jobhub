require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',

    server: {
        port: parseInt(process.env.PORT) || 5000,
        corsOrigins: process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:5000']
    },

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'jobhubdb',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
        poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },

    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
        allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },

    pagination: {
        defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 20,
        maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT) || 100
    },

    email: {
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
        from: process.env.EMAIL_FROM || 'noreply@jobhub.com'
    },

    ai: {
        geminiApiKey: process.env.GEMINI_API_KEY
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
    }
};

const requiredEnvVars = ['JWT_SECRET'];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`FATAL: ${varName} environment variable is not set.`);
        process.exit(1);
    }
});

module.exports = config;
