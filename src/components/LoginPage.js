import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify'; // Import Amplify for configuration
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
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
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

    // Handle editing an existing record
    const handleEdit = (record) => {
        setId(record.id); // Set ID for editing
        setContent(record.content); // Load content into the textarea for editing
        setIsEditing(true); // Set editing mode to true
    };

    // Save or update content
    const handleSaveContent = async (e) => {
        e.preventDefault(); // Prevent form refresh

        const body = JSON.stringify({ id, content });

        console.log('Request Body:', body);

        try {
            const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';

            // Use PUT for updating existing entries, POST for creating new ones
            const response = await fetch(apiUrl, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get the response text for better debugging
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Response from API:', result);
            alert('Content saved successfully!');
            setIsEditing(false); // Reset editing state
            fetchRecords(); // Refresh records after saving
        } catch (error) {
            console.error('Error saving content:', error);
            alert(`Failed to save content: ${error.message}`);
        }
    };

    // Handle deleting a record
    const handleDelete = async (recordId) => {
        try {
            const apiUrl = `https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor/${recordId}`;
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Response from API:', result);
                alert('Content deleted successfully!');
                fetchRecords(); // Refresh records after deleting
            } else {
                console.error('Failed to delete record:', response);
                alert('Failed to delete record.');
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content.');
        }
    };

    return (
        <div>
            <h1>Simple API Test</h1>

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

                <button
                    type="submit"
                    style={{ marginTop: '20px', padding: '10px', backgroundColor: isEditing ? '#28a745' : '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    {isEditing ? 'Update Content' : 'Save Content'}
                </button>
            </form>

            {/* Display records for editing */}
            <h3 style={{ marginTop: '40px' }}>Saved Records:</h3>
            <ul>
                {records.length > 0 ? (
                    records.map((record) => (
                        <li key={record.id}>
                            <strong>ID:</strong> {record.id} | <strong>Content:</strong> {record.content}
                            <button onClick={() => handleEdit(record)} style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '3px' }}>
                                Edit
                            </button>
                            <button onClick={() => handleDelete(record.id)} style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#FF0000', color: 'white', border: 'none', borderRadius: '3px' }}>
                                Delete
                            </button>
                        </li>
                    ))
                ) : (
                    <li>No records found.</li>
                )}
            </ul>
        </div>
    );
}

export default SimpleApiTest;
