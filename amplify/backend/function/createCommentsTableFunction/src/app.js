const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
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
            replies: [] // Initialize replies as an empty array
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
app.delete('/createTable/:commentId', async (req, res) => {
    const commentId = decodeURIComponent(req.params.commentId);  

    const params = {
      TableName: tableName,
      Key: { commentId },
    };

    try {
      await ddbDocClient.send(new DeleteCommand(params));
      res.status(200).json({ message: 'Comment deleted successfully', commentId });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/************************************
 * HTTP Delete method to delete a specific reply from a comment
 ************************************/
app.delete('/createTable/:commentId/reply/:replyIndex', async (req, res) => {
    const commentId = decodeURIComponent(req.params.commentId);
    const replyIndex = parseInt(req.params.replyIndex, 10);

    // Fetch the comment by its ID
    const getParams = {
        TableName: tableName,
        Key: { commentId },
    };

    try {
        const commentData = await ddbDocClient.send(new GetCommand(getParams));

        if (!commentData.Item) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = commentData.Item;

        // Ensure the reply index is within bounds
        if (!comment.replies || replyIndex < 0 || replyIndex >= comment.replies.length) {
            return res.status(400).json({ message: 'Invalid reply index' });
        }

        // Remove the reply at the specified index
        comment.replies.splice(replyIndex, 1);

        // Update the comment in the database with the modified replies array
        const updateParams = {
            TableName: tableName,
            Key: { commentId },
            UpdateExpression: 'SET replies = :replies',
            ExpressionAttributeValues: {
                ':replies': comment.replies,
            },
        };

        await ddbDocClient.send(new UpdateCommand(updateParams));

        res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});
  

/************************************
 * HTTP Post method to add a reply to a comment
 ************************************/
app.post('/createTable/:commentId/reply', async (req, res) => {
    const commentId = req.params.commentId;
    const { userId, content } = req.body;

    if (!commentId || !userId || !content) {
        return res.status(400).json({ error: 'Missing required fields: commentId, userId, or content' });
    }

    const reply = {
        replyId: new Date().getTime().toString(), // Unique ID for the reply
        userId,
        content,
        timestamp: new Date().toISOString()
    };

    const params = {
        TableName: tableName,
        Key: { commentId }, 
        UpdateExpression: 'SET replies = list_append(if_not_exists(replies, :empty_list), :reply)',
        ExpressionAttributeValues: {
            ':reply': [reply],
            ':empty_list': []
        },
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const result = await ddbDocClient.send(new UpdateCommand(params));
        res.json({ success: 'Reply added successfully', result });
    } catch (err) {
        console.error('Failed to add reply:', err);
        res.status(500).json({ error: 'Could not add reply: ' + err.message });
    }
});

module.exports = app;
