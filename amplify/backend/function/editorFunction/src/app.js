const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
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

/************************************
 * HTTP Get method to retrieve all items
 ************************************/
app.get('/editor', async function (req, res) {
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
 * HTTP Post method to insert a new item
 ************************************/
app.post('/editor', async function (req, res) {
  const { id, content } = req.body;

  if (!id || !content) {
    return res.status(400).json({ error: 'Missing id or content in request body' });
  }

  const params = {
    TableName: tableName,
    Item: {
      id: id,
      content: content,
      lastUpdated: new Date().toISOString(),
      isBeingEdited: false,
      currentUserId: null,
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
 * HTTP Put method to mark an item as being edited by a user
 ************************************/
app.put('/editor/edit/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);
  const { userId } = req.body;

  if (!id || !userId) {
    return res.status(400).json({ error: 'Missing id or userId in request body' });
  }

  const getParams = {
    TableName: tableName,
    Key: { id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(getParams));
    if (data.Item) {
      if (data.Item.isBeingEdited && data.Item.currentUserId !== userId) {
        return res.status(403).json({ error: 'This content is currently being edited by another user.' });
      }

      const updateParams = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set isBeingEdited = :isBeingEdited, currentUserId = :currentUserId',
        ExpressionAttributeValues: {
          ':isBeingEdited': true,
          ':currentUserId': userId,
        },
      };

      await ddbDocClient.send(new UpdateCommand(updateParams));
      res.json({ success: 'Item marked as being edited successfully!', id });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not mark item as being edited: ' + err.message });
  }
});

/************************************
 * HTTP Get method to retrieve a single item by ID
 ************************************/
app.get('/editor/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);

  const params = {
    TableName: tableName,
    Key: { id },
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
 * HTTP Put method to update an existing item
 ************************************/
app.put('/editor/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);
  const { content, userId } = req.body;

  if (!id || !content || !userId) {
    return res.status(400).json({ error: 'Missing id, content, or userId in request body' });
  }

  const getParams = {
    TableName: tableName,
    Key: { id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(getParams));
    if (data.Item) {
      if (data.Item.isBeingEdited && data.Item.currentUserId !== userId) {
        return res.status(403).json({ error: 'Sorry, someone else is currently editing this content.' });
      }

      const updateParams = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set content = :content, lastUpdated = :lastUpdated, isBeingEdited = :isBeingEdited, currentUserId = :currentUserId',
        ExpressionAttributeValues: {
          ':content': content,
          ':lastUpdated': new Date().toISOString(),
          ':isBeingEdited': false,
          ':currentUserId': null,
        },
      };

      await ddbDocClient.send(new UpdateCommand(updateParams));
      res.json({ success: 'Item updated successfully!', id });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not update item: ' + err.message });
  }
});

/************************************
 * HTTP Put method to unlock an item (indicate editing is finished)
 ************************************/
app.put('/editor/unlock/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);
  const { userId } = req.body;

  if (!id || !userId) {
    return res.status(400).json({ error: 'Missing id or userId in request body' });
  }

  const getParams = {
    TableName: tableName,
    Key: { id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(getParams));
    if (data.Item) {
      if (data.Item.currentUserId !== userId) {
        return res.status(403).json({ error: 'You are not the user currently editing this content.' });
      }

      const updateParams = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set isBeingEdited = :isBeingEdited, currentUserId = :currentUserId',
        ExpressionAttributeValues: {
          ':isBeingEdited': false,
          ':currentUserId': null,
        },
      };

      await ddbDocClient.send(new UpdateCommand(updateParams));
      res.json({ success: 'Item unlocked successfully!', id });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Could not unlock item: ' + err.message });
  }
});

/************************************
 * HTTP Delete method to remove an item by ID
 ************************************/
app.delete('/editor/:id', async function (req, res) {
  const id = decodeURIComponent(req.params.id);

  const params = {
    TableName: tableName,
    Key: { id },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: 'Item deleted successfully!', id });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete item: ' + err.message });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object for Lambda
module.exports = app;
