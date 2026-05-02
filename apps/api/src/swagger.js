import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Hub API',
      version: '1.0.0',
      description: 'Collaborative Team Hub REST API',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://teamhub-production-3267.up.railway.app'
          : 'http://localhost:4000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)