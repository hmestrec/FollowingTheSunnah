import React, { useRef } from 'react';
import { Authenticator } from '@aws-amplify/ui-react'; // Import the Authenticator
import { post } from '@aws-amplify/api-rest'; // Import post from api-rest
import { Amplify } from 'aws-amplify'; // Import Amplify to configure it
import awsconfig from '../aws-exports'; // Ensure this file is in the correct path

// Configure Amplify
Amplify.configure(awsconfig);

function EditorPage() {
  const editorRef = useRef(null); // Use a ref to manage the editor area

  // Function to save content to DynamoDB via Lambda and API Gateway
  const saveContent = async () => {
    const editorContent = editorRef.current.innerHTML; // Get the content from the editor
    const id = Date.now().toString(); // Generate a unique ID based on the timestamp

    try {
      // Ensure that 'saver' is the correct API name and '/editor' is the correct path
      await post('saver', '/editor', {
        body: { id, content: editorContent },
      });
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

              {/* Toolbar */}
              {/* Add your toolbar buttons here */}

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
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    justifyContent: 'center',
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
