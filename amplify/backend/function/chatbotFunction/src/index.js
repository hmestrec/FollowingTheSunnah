const https = require('https');

exports.handler = async (event) => {
    const { userMessage } = JSON.parse(event.body);

    if (!userMessage) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify({ error: 'User message is required.' }),
        };
    }

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
        model: 'ft:gpt-3.5-turbo-0125:followingsunnah::AcU1dthp',
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 200,
    });

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
                        'Access-Control-Allow-Origin': '*', // Allow all origins
                        'Access-Control-Allow-Headers': 'Content-Type', // Allow specific headers
                        'Access-Control-Allow-Methods': 'POST', // Allow specific methods
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
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST',
                },
                body: JSON.stringify({ error: error.message }),
            });
        });

        req.write(requestBody);
        req.end();
    });
};
