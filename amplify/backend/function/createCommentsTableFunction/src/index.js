const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app'); // Import the Express app

// Create the server as you did in your working example
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};
