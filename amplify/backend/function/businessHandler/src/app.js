const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    ScanCommand,
    DeleteCommand,
    UpdateCommand
} = require('@aws-sdk/lib-dynamodb');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// Initialize DynamoDB Client and Document Client
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Define table name
const tableName = process.env.ENV ? `BusinessTable-${process.env.ENV}` : 'BusinessTable-prd';

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.sendStatus(200); // Respond to preflight requests with 200 OK
    } else {
        next(); // Continue to the next middleware or route
    }
});


/************************************
 * HTTP GET method to retrieve all businesses
 ************************************/
app.get('/businesses', async (req, res) => {
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
 * HTTP POST method to add a new business
 ************************************/
app.post('/businesses', async (req, res) => {
    const { id, name, location, contact } = req.body;

    if (!id || !name || !location || !contact) {
        return res.status(400).json({ error: 'Missing required fields: id, name, location, or contact' });
    }

    const params = {
        TableName: tableName,
        Item: {
            id,
            name,
            location,
            contact,
            createdAt: new Date().toISOString()
        },
    };

    try {
        await ddbDocClient.send(new PutCommand(params));
        res.status(201).json({ message: 'Business added successfully' });
    } catch (err) {
        console.error("Error saving business:", err);
        res.status(500).json({ error: 'Could not save business: ' + err.message });
    }
});

/************************************
 * HTTP GET method to retrieve a business by ID
 ************************************/
app.get('/businesses/:id', async (req, res) => {
    const { id } = req.params;

    const params = {
        TableName: tableName,
        Key: { id },
    };

    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        if (!data.Item) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.status(200).json(data.Item);
    } catch (error) {
        console.error("Error fetching business:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

/************************************
 * HTTP DELETE method to delete a business by ID
 ************************************/
app.delete('/businesses/:id', async (req, res) => {
    const { id } = req.params;

    const params = {
        TableName: tableName,
        Key: { id },
    };

    try {
        await ddbDocClient.send(new DeleteCommand(params));
        res.status(200).json({ message: 'Business deleted successfully' });
    } catch (error) {
        console.error("Error deleting business:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

/************************************
 * HTTP PUT method to update a business by ID
 ************************************/
app.put('/businesses/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, contact } = req.body;

    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {}; // Add this to map attribute names

    if (name) {
        updateExpressions.push('#name = :name');
        expressionAttributeNames['#name'] = 'name'; // Alias for the reserved keyword
        expressionAttributeValues[':name'] = name;
    }
    if (location) {
        updateExpressions.push('#location = :location');
        expressionAttributeNames['#location'] = 'location'; // Alias for the reserved keyword
        expressionAttributeValues[':location'] = location;
    }
    if (contact) {
        updateExpressions.push('contact = :contact'); // `contact` is not reserved
        expressionAttributeValues[':contact'] = contact;
    }

    const params = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames, // Include aliases
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    };

    try {
        const result = await ddbDocClient.send(new UpdateCommand(params));
        res.status(200).json({ message: 'Business updated successfully', result: result.Attributes });
    } catch (error) {
        console.error("Error updating business:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



module.exports = app;
