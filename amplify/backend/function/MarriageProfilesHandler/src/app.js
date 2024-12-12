const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// Initialize DynamoDB Client
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Setup the DynamoDB Table Name
let tableName = "MarriageProfiles";
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

/************************************
 * HTTP Get method to retrieve all profiles
 ************************************/
app.get('/profiles', async function (req, res) {
  const params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: 'Could not load profiles: ' + err.message });
  }
});

/************************************
 * HTTP Get method to retrieve a specific profile by ID
 ************************************/
app.get('/profiles/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);

  const params = {
    TableName: tableName,
    Key: { profile_id: id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    if (data.Item) {
      res.json(data.Item);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not load profile: ' + err.message });
  }
});

/************************************
 * HTTP Post method to create a new profile
 ************************************/
app.post('/profiles', async function (req, res) {
  const { profile_id, name, age, gender, location, description, preferences } = req.body;

  if (!profile_id || !name) {
    return res.status(400).json({ error: 'Missing profile_id or name in request body' });
  }

  const params = {
    TableName: tableName,
    Item: {
      profile_id,
      name,
      age,
      gender,
      location,
      description,
      preferences,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.json({ success: 'Profile created successfully!', profile_id });
  } catch (err) {
    res.status(500).json({ error: 'Could not create profile: ' + err.message });
  }
});

/************************************
 * HTTP Put method to update an existing profile
 ************************************/
app.put('/profiles/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);
  const { name, age, gender, location, description, preferences } = req.body;

  const updateParams = {
    TableName: tableName,
    Key: { profile_id: id },
    UpdateExpression: 'set #name = :name, age = :age, gender = :gender, location = :location, description = :description, preferences = :preferences, updated_at = :updated_at',
    ExpressionAttributeValues: {
      ':name': name,
      ':age': age,
      ':gender': gender,
      ':location': location,
      ':description': description,
      ':preferences': preferences,
      ':updated_at': new Date().toISOString(),
    },
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const data = await ddbDocClient.send(new UpdateCommand(updateParams));
    res.json({ success: 'Profile updated successfully!', data });
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile: ' + err.message });
  }
});

/************************************
 * HTTP Delete method to remove a profile
 ************************************/
app.delete('/profiles/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);

  const params = {
    TableName: tableName,
    Key: { profile_id: id },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: 'Profile deleted successfully!', profile_id: id });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete profile: ' + err.message });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object for Lambda
module.exports = app;
