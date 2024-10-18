const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME; // Automatically set by Amplify

exports.handler = async (event) => {
  const method = event.httpMethod;

  if (method === 'POST') {
    // Parse the body of the request to get the content
    const body = JSON.parse(event.body);
    const { id, content } = body;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: id, // Unique identifier for the content
        content: content, // The actual content from the editor
      },
    };

    try {
      await dynamo.put(params).promise();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Content saved successfully' }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not save content', details: error.message }),
      };
    }
  }

  if (method === 'GET') {
    const { id } = event.queryStringParameters; // Get the id from the query string

    const params = {
      TableName: TABLE_NAME,
      Key: {
        id: id, // Use the id to fetch the content
      },
    };

    try {
      const data = await dynamo.get(params).promise();
      if (data.Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(data.Item),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Content not found' }),
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not fetch content', details: error.message }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
