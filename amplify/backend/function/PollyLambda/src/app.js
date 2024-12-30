const express = require('express');
const bodyParser = require('body-parser');
const { Polly } = require('aws-sdk');
const app = express();

// Create a new instance of Polly
const polly = new Polly();

// Middleware for parsing JSON
app.use(bodyParser.json()); // For parsing application/json

// Enable CORS for all incoming requests
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins (can be restricted to specific origins)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow the methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow the necessary headers
  next(); // Proceed to the next middleware
});

// Polly synthesize speech route
app.post('/polly-synthesize', async (req, res) => {
  const { text, voiceId = "Stephen" } = req.body; // Default voiceId to Stephen

  const params = {
    Text: text,
    VoiceId: voiceId, // Use dynamic voiceId passed from frontend or default to Stephen
    OutputFormat: "mp3",
    Engine: "neural", // You can choose "standard" if needed
  };

  try {
    const data = await polly.synthesizeSpeech(params).promise();
    const audioStream = data.AudioStream;
    const base64Audio = audioStream.toString('base64');

    res.status(200).json({
      audioUrl: `data:audio/mp3;base64,${base64Audio}`,
    });
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    res.status(500).json({ message: "Error synthesizing speech" });
  }
});

// Example to handle any errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Export the app
module.exports = app;
