require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { testConnection } = require('./config/supabase');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isDevelopment ? false : undefined
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Compression
app.use(compression());

// Rate Limiting
const { globalLimiter, apiLimiter } = require('./middleware/rateLimiter');
app.use(globalLimiter);
app.use('/api/v1', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'JobHub API is running',
        timestamp: new Date().toISOString()
    });
});

// Test Supabase connection route
app.get('/api/test-db', async (req, res) => {
    const isConnected = await testConnection();
    if (isConnected) {
        res.json({ status: 'ok', message: 'Database connection successful' });
    } else {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/scholarships', require('./routes/scholarshipRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/international-jobs', require('./routes/internationalJobRoutes'));
app.use('/api/time-exchange', require('./routes/timeExchangeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// API Versioning � v1 (parallel mount, same handlers)
app.use('/api/v1', require('./routes/v1'));

// Swagger/OpenAPI docs
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'JobHub API Docs'
}));

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Create HTTP server for Socket.IO binding
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },
    path: '/socket.io'
});

const { setupSocket } = require('./socket');
setupSocket(io);

// Start server (only when running locally, not on Vercel)
if (process.env.VERCEL !== '1') {
    const startServer = async () => {
        console.log('Testing PostgreSQL connection...');
        await testConnection();

        server.listen(PORT, () => {
            console.log('JobHub Server running on port ' + PORT);
            console.log('API available at http://localhost:' + PORT + '/api');
            console.log('Socket.IO ready at http://localhost:' + PORT + '/socket.io');
            console.log('Swagger docs at http://localhost:' + PORT + '/api/v1/docs');
        });
    };

    startServer();
}

// Export app for Vercel serverless functions
module.exports = app;
