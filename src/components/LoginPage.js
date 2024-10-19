import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react'; // Import Authenticator from Amplify
import { Amplify, Auth } from 'aws-amplify'; // Import Amplify for configuration
import awsconfig from '../aws-exports'; // Import your Amplify configuration

// Configure Amplify
Amplify.configure(awsconfig);

function SimpleApiTest() {
    const [content, setContent] = useState(''); // State to store the content
    const [id, setId] = useState(''); // State to store the ID input
    const [isEditing, setIsEditing] = useState(false); // State to track if editing an existing entry
    const [records, setRecords] = useState([]); // State to hold records fetched from the API

    // Function to fetch all records from DynamoDB
    const fetchRecords = async () => {
        try {
            const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
            const session = await Auth.currentSession(); // Get the current session
            const token = session.idToken.jwtToken; // Get the JWT token
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Add token to headers
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRecords(data); // Set the fetched records to state
            } else {
                console.error('Failed to fetch records:', response);
                alert('Failed to fetch records.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            alert('Error fetching records.');
        }
    };

    // Fetch records on initial load
    useEffect(() => {
        fetchRecords();
    }, []);

    // Fetch content by ID for editing
    const handleFetchContent = async () => {
        try {
            const apiUrl = `https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor/${id}`;
            const session = await Auth.currentSession(); // Get the current session
            const token = session.idToken.jwtToken; // Get the JWT token
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Add token to headers
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setContent(data.content); // Preload content into the textarea
                setIsEditing(true); // Set editing mode to true
                alert('Content loaded for editing.');
            } else {
                alert('Content not found.');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        }
    };

    // Save or update content
    const handleSaveContent = async (e) => {
        e.preventDefault(); // Prevent form refresh

        const body = JSON.stringify({ id, content });

        console.log('Request Body:', body);

        try {
            const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
            const session = await Auth.currentSession(); // Get the current session
            const token = session.idToken.jwtToken; // Get the JWT token

            const response = await fetch(apiUrl, {
                method: isEditing ? 'PUT' : 'POST', // Use PUT for updating existing entries
                headers: {
                    'Authorization': `Bearer ${token}`, // Add token to headers
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const result = await response.json();
            console.log('Response from API:', result);
            alert('Content saved successfully!');
            setIsEditing(false); // Reset editing state
            fetchRecords(); // Refresh records after saving
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Failed to save content.');
        }
    };

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

                        <button
                            type="button"
                            onClick={handleFetchContent}
                            style={{ marginTop: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
                        >
                            Load Content for Editing
                        </button>

                        <label htmlFor="content" style={{ marginTop: '20px' }}>Enter Content:</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)} // Update state when input changes
                            rows="5"
                            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                        />

                        <button
                            type="submit"
                            style={{ marginTop: '20px', padding: '10px', backgroundColor: isEditing ? '#28a745' : '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}
                        >
                            {isEditing ? 'Update Content' : 'Save Content'}
                        </button>
                    </form>

                    <button onClick={signOut} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#FF0000', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Sign Out
                    </button>
                </div>
            )}
        </Authenticator>
    );
}

export default SimpleApiTest;
