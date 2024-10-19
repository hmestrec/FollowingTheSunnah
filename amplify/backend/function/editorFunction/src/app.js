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
  if (req.apiGateway.event.requestContext.identity.cognitoIdentityId) {
    req.userId = req.apiGateway.event.requestContext.identity.cognitoIdentityId;
    next();
  } else {
    return res.status(403).json({ error: 'User not authenticated.' });
  }
};

/************************************
 * HTTP Get method to retrieve all items
 ************************************/
app.get('/editor', checkUserAuth, async function (req, res) {
  const params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: 'Could not load items: ' + err.message });
  }
});

/************************************
 * HTTP Get method to retrieve a single item by ID
 ************************************/
app.get('/editor/:id', checkUserAuth, async function (req, res) {
  const params = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    if (data.Item) {
      res.json(data.Item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not load item: ' + err.message });
  }
});

/************************************
 * HTTP Post method to insert a new item
 ************************************/
app.post('/editor', checkUserAuth, async function (req, res) {
  const { id, content } = req.body; // Expecting id and content in the request body

  if (!id || !content) {
    return res.status(400).json({ error: 'Missing id or content in request body' });
  }

  const params = {
    TableName: tableName,
    Item: {
      id: id,
      content: content,
      userId: req.userId // Store the userId (Cognito identity)
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.json({ success: 'Item saved successfully!', id });
  } catch (err) {
    res.status(500).json({ error: 'Could not save item: ' + err.message });
  }
});

/************************************
 * HTTP Delete method to remove an item by ID
 ************************************/
app.delete('/editor/:id', checkUserAuth, async function (req, res) {
  const params = {
    TableName: tableName,
    Key: {
      id: req.params.id,
      userId: req.userId // Ensure the authenticated user is the one who created the item
    },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: 'Item deleted successfully!', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete item: ' + err.message });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object for Lambda
module.exports = app;
