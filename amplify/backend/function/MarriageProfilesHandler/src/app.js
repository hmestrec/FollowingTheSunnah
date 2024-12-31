const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

// Initialize DynamoDB
const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// DynamoDB Table Name
const tableName = process.env.ENV ? `MarriageProfiles-${process.env.ENV}` : 'MarriageProfiles-prd';

// Cognito JWKS URL
const jwksUri = `https://cognito-idp.${process.env.TABLE_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`;
const client = jwksClient({ jwksUri });

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Authentication Middleware
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Token is missing.' });
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
    req.user = decoded; // Attach user details to the request
    next();
  });
};

/************************************
 * HTTP GET: Fetch ALL profiles (No auth required)
 ************************************/
app.get('/profiles', async (req, res) => {
  const params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    console.error('Error fetching all profiles:', err);
    res.status(500).json({ error: 'Could not load profiles: ' + err.message });
  }
});

/************************************
 * HTTP GET: Fetch profile by user_id (No auth required)
 ************************************/
app.get('/profiles/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const params = {
    TableName: tableName,
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': user_id,
    },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    if (data.Items.length > 0) {
      res.json(data.Items[0]);
    } else {
      res.status(404).json({ error: 'No profile found for this user.' });
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Could not fetch profile: ' + err.message });
  }
});

/************************************
 * HTTP POST: Create a new profile (Auth required)
 ************************************/
app.post('/profiles', authenticate, async (req, res) => {
  const {
    user_id,
    profile_id,
    name,
    age,
    gender,
    description,
    preferences,
    location,
    bio,
    goals,
    deen,
  } = req.body;

  if (!user_id || !profile_id || !name) {
    return res.status(400).json({ error: 'Missing user_id, profile_id, or name' });
  }

  const params = {
    TableName: tableName,
    Item: {
      user_id,
      profile_id,
      name,
      age,
      gender,
      location,
      description,
      preferences,
      bio,
      goals,
      deen,
      created_at: new Date().toISOString(),
    },
    ConditionExpression: 'attribute_not_exists(user_id)',
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.json({ success: 'Profile created successfully!', profile_id });
  } catch (err) {
    console.error('Error creating profile:', err);
    res.status(500).json({ error: 'Could not create profile: ' + err.message });
  }
});

/************************************
 * HTTP PUT: Update a profile (Auth required)
 ************************************/
app.put('/profiles/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params;
  const { name, age, gender, location, description, preferences, bio, goals, deen, profile_id } = req.body;

  if (!profile_id) {
    return res.status(400).json({ error: 'Missing profile_id in request body' });
  }

  const params = {
    TableName: tableName,
    Key: { user_id, profile_id },
    UpdateExpression: `
      SET #name = :name, 
          age = :age, 
          gender = :gender, 
          #location = :location, 
          description = :description, 
          preferences = :preferences, 
          bio = :bio, 
          goals = :goals, 
          deen = :deen, 
          updated_at = :updated_at
    `,
    ExpressionAttributeNames: {
      '#name': 'name',
      '#location': 'location',
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':age': age,
      ':gender': gender,
      ':location': location,
      ':description': description,
      ':preferences': preferences,
      ':bio': bio,
      ':goals': goals,
      ':deen': deen,
      ':updated_at': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    res.json({ success: 'Profile updated successfully!', updatedItem: result.Attributes });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Could not update profile: ' + err.message });
  }
});

/************************************
 * HTTP DELETE: Delete a profile (Auth required)
 ************************************/
app.delete('/profiles', authenticate, async (req, res) => {
  const { user_id, profile_id } = req.body;

  if (!user_id || !profile_id) {
    return res.status(400).json({ error: 'Missing user_id or profile_id in request body' });
  }

  const params = {
    TableName: tableName,
    Key: {
      user_id: user_id,
      profile_id: profile_id,
    },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: 'Profile deleted successfully!', profile_id });
  } catch (err) {
    console.error('Error deleting profile:', err.message);
    res.status(500).json({ error: 'Could not delete profile: ' + err.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log('MarriageProfiles app started');
});

// Export app for Lambda
module.exports = app;
