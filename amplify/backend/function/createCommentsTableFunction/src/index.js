const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app'); // Import the Express app
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
    // Forward the event and context to the Express app via aws-serverless-express
    return awsServerlessExpress.proxy(server, event, context);
};
