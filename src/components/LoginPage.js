import React, { useRef } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { API } from 'aws-amplify'; // Correct API import
import { Amplify } from 'aws-amplify'; 
import awsconfig from '../aws-exports'; 

// Configure Amplify
Amplify.configure(awsconfig);

function EditorPage() {
    const editorRef = useRef(null); // Use a ref to manage the editor area

    // Function to save content to DynamoDB via API Gateway
    const saveContent = async () => {
        const editorContent = editorRef.current.innerHTML; // Get the content from the editor
        const id = Date.now().toString(); // Generate a unique ID based on the timestamp

        // Construct the request body to match the backend API format
        const body = {
            id: id, 
            content: editorContent
        };

        console.log('Request Body:', body); // Log the body to check its content

        try {
            // Use API.post to save content
            const response = await API.post('editorAPI', '/editor', { body }); // Correct API method
            console.log('Response from API:', response); // Log the API response
            alert('Content saved successfully!');
        } catch (error) {
            console.error('Error saving content:', error);
        }
    };

    return (
        <div>
            <header>
                <h1>Following the Sunnah</h1>
            </header>

            <Authenticator>
                {({ signOut, user }) => (
                    <div>
                        <h2>Hello {user.username}</h2>
                        <button onClick={signOut}>Sign Out</button>

                        <div style={styles.container}>
                            <h1 style={styles.title}>Simple Word Document-like Editor</h1>

                            {/* Editable Document Area */}
                            <div
                                ref={editorRef}
                                contentEditable="true"
                                style={styles.editor}
                                suppressContentEditableWarning={true}
                            >
                                <p>This is an editable area. Start typing here...</p>
                            </div>

                            {/* Save Button */}
                            <div style={{ marginTop: '20px' }}>
                                <button onClick={saveContent} style={styles.saveButton}>Save Content</button>
                            </div>
                        </div>
                    </div>
                )}
            </Authenticator>

            <footer>
                &copy; 2024 Following the Sunnah. All rights reserved.
            </footer>
        </div>
    );
}

export default EditorPage;

// Styles used for the editor
const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f4f4f9',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    editor: {
        border: '1px solid #ddd',
        padding: '20px',
        minHeight: '300px',
        backgroundColor: 'white',
        overflowY: 'auto',
        borderRadius: '4px',
    },
    saveButton: {
        padding: '10px',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};
