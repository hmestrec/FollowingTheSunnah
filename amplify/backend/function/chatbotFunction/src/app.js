const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Ensure you have this package installed

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// CORS Middleware (for additional control)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow all HTTP methods

  if (req.method === "OPTIONS") {
    res.sendStatus(200); // Respond to preflight requests
  } else {
    next(); // Proceed to route handling
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
        throw new Error('OpenAI API key is missing.');
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
