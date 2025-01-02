const express = require("express");
const AWS = require("aws-sdk");

// AWS configuration
AWS.config.update({ region: "us-east-1" }); // Replace with your AWS region

const SES = new AWS.SES();
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});


// Middleware to handle base64-encoded body (if API Gateway uses base64 encoding)
app.use((req, res, next) => {
  if (req.isBase64Encoded) {
    req.body = JSON.parse(Buffer.from(req.body, "base64").toString("utf-8"));
  }
  next();
});

const verifyCaptcha = async (captchaToken) => {
  const secretKey = process.env.reCAPTCHA_SECRET_KEY; // Use the environment variable
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

  const response = await fetch(verificationUrl, { method: "POST" });
  const data = await response.json();

  return data.success; // true if reCAPTCHA verification is successful
};


app.post("/send-email", async (req, res) => {
  const {
    name,
    email,
    subject,
    message,
    type,
    captchaToken,
    brotherName,
    waliName,
    masjidLocation,
    proposedDateTime,
    additionalNotes,
  } = req.body;

  if (!name || !email || !subject || !type || !captchaToken) {
    return res.status(400).json({ error: "All fields are required, including reCAPTCHA." });
  }

  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    return res.status(400).json({ error: "reCAPTCHA validation failed." });
  }

  // Map type to source email addresses
  const sourceEmailMap = {
    "Bug Report": "bug.report@followingsunnah.net",
    "Feature Request": "feature.request@followingsunnah.net",
    "General Message": "general.message@followingsunnah.net",
    "Set Up Meeting": "meeting.request@followingsunnah.net",
  };

  const sourceEmail = sourceEmailMap[type];
  if (!sourceEmail) {
    return res.status(400).json({ error: "Invalid message type." });
  }

  // Prepare email body based on type
  let emailBody = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`;
  if (type === "Set Up Meeting") {
    if (!brotherName || !waliName || !masjidLocation || !proposedDateTime) {
      return res.status(400).json({ error: "All fields are required for Set Up Meeting." });
    }
    emailBody = `
      Name: ${name}
      Email: ${email}
      Brother's Name: ${brotherName}
      Wali's Name: ${waliName}
      Masjid Location: ${masjidLocation}
      Proposed Date/Time: ${proposedDateTime}
      Additional Notes: ${additionalNotes || "None"}
    `;
  }

  // Prepare email parameters
  const params = {
    Source: sourceEmail, // Dynamic source email based on type
    Destination: {
      ToAddresses: ["support@followingsunnah.net"], // Constant recipient email
    },
    Message: {
      Subject: { Data: `[${type}] ${subject}` },
      Body: {
        Text: { Data: emailBody },
      },
    },
  };

  try {
    // Send email using AWS SES
    await SES.sendEmail(params).promise();
    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email." });
  }
});


// Route to handle newsletter subscription
app.post("/subscribe-newsletter", async (req, res) => {
  console.log("Request body:", req.body); // Debugging log
  const { email } = req.body;

  // Validate request body
  if (!email) {
    return res.status(400).json({ error: "Email is required for subscription." });
  }

  // Prepare email parameters
  const params = {
    Source: "newsletter@followingsunnah.net", // Verified sender email for newsletters
    Destination: {
      ToAddresses: ["newsletter@followingsunnah.net"], // Recipient for subscriptions
    },
    Message: {
      Subject: { Data: `New Newsletter Subscription` },
      Body: {
        Text: { Data: `New subscriber email: ${email}` },
      },
    },
  };

  try {
    // Send email using AWS SES
    await SES.sendEmail(params).promise();
    return res.status(200).json({ message: "Subscription successful." });
  } catch (error) {
    console.error("Error processing subscription:", error);
    return res.status(500).json({ error: "Failed to subscribe email." });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export the app for serverless or local deployment
module.exports = app;
