const https = require('https');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

// JWKS URI for Cognito User Pool
const jwksUri = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`;
const client = jwksClient({ jwksUri });

const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                reject(new Error('Unauthorized. Invalid token.'));
            } else {
                resolve(decoded);
            }
        });
    });
};

exports.handler = async (event) => {
    const token = event.headers.Authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify({ error: 'Unauthorized. Token is missing.' }),
        };
    }

    try {
        // Verify the token
        await verifyToken(token);
    } catch (error) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify({ error: error.message }),
        };
    }

    // Extract user message
    const { userMessage } = JSON.parse(event.body);

    if (!userMessage) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify({ error: 'User message is required.' }),
        };
    }

    // OpenAI API call setup
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
    };

    const requestBody = JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 200,
    });

    // Make request to OpenAI API
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        'Access-Control-Allow-Methods': 'POST',
                    },
                    body: data,
                });
            });
        });

        req.on('error', (error) => {
            reject({
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'POST',
                },
                body: JSON.stringify({ error: error.message }),
            });
        });

        req.write(requestBody);
        req.end();
    });
};
