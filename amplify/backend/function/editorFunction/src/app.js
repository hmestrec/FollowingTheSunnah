const jwt = require('jsonwebtoken'); // Add this import
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// Initialize DynamoDB Client
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Setup the DynamoDB Table Name
let tableName = "editorcontent";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = `${tableName}-${process.env.ENV}`;
}

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Middleware to check for authenticated user identity
const checkUserAuth = (req, res, next) => {
  const token = req.headers.Authorization ? req.headers.Authorization.split(' ')[1] : null;

  if (token) {
    jwt.verify(token, process.env.COGNITO_POOL_PUBLIC_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'User not authenticated.' });
      }
      req.userId = decoded.sub; // Use the user ID from the token
      next();
    });
  } else {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
};

// Your existing API routes...

module.exports = app;
