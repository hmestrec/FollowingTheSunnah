const express = require('express');
const bodyParser = require('body-parser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
app.use(bodyParser.json());

// Set up DynamoDB client and table name
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION || 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = "Comments-prd";

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    next();
});

// GET /createTable - Retrieve all comments
app.get('/createTable', async (req, res) => {
    const params = {
        TableName: tableName,
        Select: 'ALL_ATTRIBUTES',
    };

    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        res.json(data.Items);
    } catch (err) {
        res.status(500).json({ error: 'Could not load comments: ' + err.message });
    }
});

// POST /createTable - Add a new comment
app.post('/createTable', async (req, res) => {
    const { postId, userId, content } = req.body;
    const commentId = new Date().getTime().toString(); // Unique ID for each comment
    const timestamp = new Date().toISOString();

    const params = {
        TableName: tableName,
        Item: {
            commentId,
            postId,
            userId,
            content,
            timestamp,
        },
    };

    try {
        await ddbDocClient.send(new PutCommand(params));
        res.json({ success: 'Comment added successfully!', commentId });
    } catch (err) {
        res.status(500).json({ error: 'Could not add comment: ' + err.message });
    }
});

// DELETE /createTable/:id - Delete a specific comment by ID
app.delete('/createTable/:id', async (req, res) => {
    const id = decodeURIComponent(req.params.id);

    const params = {
        TableName: tableName,
        Key: { commentId: id },
    };

    try {
        await ddbDocClient.send(new DeleteCommand(params));
        res.json({ success: 'Comment deleted successfully!', commentId: id });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete comment: ' + err.message });
    }
});

module.exports = app;
