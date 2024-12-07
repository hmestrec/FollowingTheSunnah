const serverless = require('serverless-http');
const app = require('./app');

// Export the Express app wrapped in serverless
module.exports.handler = serverless(app);
