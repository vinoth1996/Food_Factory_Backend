const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Food Factory',
            description : 'Food Factory API',
            contact: {
                name: 'developer'
            },
            servers: ['http://localhost:3000']
        }
    },
    apis: ["./controllers/**/v1/**/*.js"]
};

module.exports = swaggerJsDoc(swaggerOptions)