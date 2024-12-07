const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const fetch = require('node-fetch'); // Ensure this package is installed

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// OpenAI Chatbot Route
app.post('/openai', async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required.' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('Missing OpenAI API Key');
      return res.status(500).json({ error: 'Missing API key in environment variables' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(response.status).json({ error: error.message });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    res.status(200).json({ assistantMessage });
  } catch (error) {
    console.error('Error in /openai route:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = app;
