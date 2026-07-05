const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JobNova API',
            version: '1.0.0',
            description: 'JobNova — AI-Ready Job Platform API. Supports blue-collar, white-collar, employer, and admin roles.',
            contact: {
                name: 'JobNova Support'
            }
        },
        servers: [
            { url: 'http://localhost:5000/api/v1', description: 'Development server (v1)' },
            { url: 'http://localhost:5000/api', description: 'Development server (legacy)' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;