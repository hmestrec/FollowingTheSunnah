import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react'; // Import Authenticator from Amplify
import { Amplify } from 'aws-amplify'; // Import Amplify for configuration
import awsconfig from '../aws-exports'; // Import your Amplify configuration

// Configure Amplify
Amplify.configure(awsconfig);

function SimpleApiTest() {
    const [content, setContent] = useState(''); // State to store the content
    const [id, setId] = useState(''); // State to store the ID input
    const [records, setRecords] = useState([]); // State to store records from DynamoDB

    // Function to fetch all records from DynamoDB
    const fetchRecords = async () => {
        try {
            // Replace with your actual API Gateway endpoint for GET
            const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
            const response = await fetch(apiUrl, {
                method: 'GET',
            });
            const data = await response.json();
            setRecords(data); // Set fetched records to state
        } catch (error) {
            console.error('Error fetching records:', error);
            alert('Failed to fetch records.');
        }
    };

    // Function to handle saving new or edited content
    const handleSaveContent = async (e) => {
        e.preventDefault(); // Prevent form refresh

        const body = JSON.stringify({ id, content });

        console.log('Request Body:', body);

        try {
            // Replace with your actual API Gateway endpoint for POST/PUT
            const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const result = await response.json();
            console.log('Response from API:', result);
            alert('Content saved successfully!');
            fetchRecords(); // Refresh records after saving
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Failed to save content.');
        }
    };

    // Function to load content for editing
    const handleEdit = (record) => {
        setId(record.id); // Set ID for editing
        setContent(record.content); // Load content into the textarea for editing
    };

    // Fetch records on initial load
    useEffect(() => {
        fetchRecords();
    }, []);

    return (
        <Authenticator>
            {({ signOut, user }) => (
                <div>
                    <h1>Simple API Test</h1>
                    <p>Welcome, {user.username}!</p>

                    <form onSubmit={handleSaveContent}>
                        <label htmlFor="id">Enter ID:</label>
                        <input
                            id="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)} // Update state when input changes
                            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                        />

                        <label htmlFor="content" style={{ marginTop: '20px' }}>Enter Content:</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)} // Update state when input changes
                            rows="5"
                            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                        />

                        <button type="submit" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}>
                            Save Content
                        </button>
                    </form>

                    {/* Records List */}
                    <div style={{ marginTop: '40px' }}>
                        <h3>Saved Records:</h3>
                        <ul>
                            {records.map((record) => (
                                <li key={record.id}>
                                    <strong>ID:</strong> {record.id} | <strong>Content:</strong> {record.content}
                                    <button onClick={() => handleEdit(record)} style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '3px' }}>
                                        Edit
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button onClick={signOut} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#FF0000', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Sign Out
                    </button>
                </div>
            )}
        </Authenticator>
    );
}

export default SimpleApiTest;
