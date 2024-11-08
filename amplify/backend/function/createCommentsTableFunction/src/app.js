const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// Initialize DynamoDB Client and Document Client
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Define table name with the environment suffix if present
const tableName = process.env.ENV ? `Comments-${process.env.ENV}` : 'Comments-prd';

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

/************************************
 * HTTP Get method to retrieve all comments
 ************************************/
app.get('/createTable', async (req, res) => {
    const params = { TableName: tableName };
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        res.status(200).json(data.Items);
    } catch (error) {
        console.error("Error fetching data from DynamoDB:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/************************************
 * HTTP Post method to add a new comment
 ************************************/
app.post('/createTable', async (req, res) => {
    const { postId, userId, content } = req.body;

    if (!postId || !userId || !content) {
        return res.status(400).json({ error: 'Missing required fields: postId, userId, or content' });
    }

    const params = {
        TableName: tableName,
        Item: {
            commentId: new Date().getTime().toString(),
            postId,
            userId,
            content,
            timestamp: new Date().toISOString(),
        },
    };

    try {
        await ddbDocClient.send(new PutCommand(params));
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (err) {
        console.error("Error saving comment:", err);
        res.status(500).json({ error: 'Could not save comment: ' + err.message });
    }
});

/************************************
 * HTTP Delete method to delete a comment by ID
 ************************************/
app.delete('/createTable/:id', async (req, res) => {
    const commentId = decodeURIComponent(req.params.id);  // Decode the ID
  
    const params = {
      TableName: "Comments-prd",  // Ensure this matches your DynamoDB table name
      Key: { commentId },  // Ensure this matches the primary key name in your table
    };
  
    try {
      await ddbDocClient.send(new DeleteCommand(params));
      res.status(200).json({ message: 'Comment deleted successfully', commentId });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  

  

module.exports = app;
