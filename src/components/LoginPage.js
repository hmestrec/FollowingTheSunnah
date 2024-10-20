import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, SignIn } from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './LogIn.css';  // Import your custom CSS for styling

Amplify.configure(awsconfig);

function SimpleApiTest() {
  const [content, setContent] = useState('');
  const [id, setId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [records, setRecords] = useState([]);
  const [openRecord, setOpenRecord] = useState(null); // State to track open record

  const fetchRecords = async () => {
    try {
      const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
      const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Records:', data); // Log the records to check for the lastUpdated field
        setRecords(data);
      } else {
        console.error('Failed to fetch records:', response);
        alert('Failed to fetch records.');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      alert('Error fetching records.');
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleEdit = (record) => {
    setId(record.id);
    setContent(record.content);
    setIsEditing(true);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    const body = JSON.stringify({ id, content });
    try {
      const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
      const response = await fetch(apiUrl, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });
      if (response.ok) {
        alert('Content saved successfully!');
        setIsEditing(false);
        fetchRecords();
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      alert(`Failed to save content: ${error.message}`);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const apiUrl = `https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor/${recordId}`;
      const response = await fetch(apiUrl, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        alert('Content deleted successfully!');
        fetchRecords();
      } else {
        alert('Failed to delete record.');
      }
    } catch (error) {
      alert('Failed to delete content.');
    }
  };

  const toggleRecord = (recordId) => {
    setOpenRecord(openRecord === recordId ? null : recordId);
  };

  // Format the date with a fallback for missing or invalid dates
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Not Available'; // Fallback for missing or invalid dates
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'clean'],
    ],
  };

  return (
    <Authenticator components={{ SignIn: { Header() { return <h2 className="custom-signin-header">Editing Login</h2>; }}}}>
      {({ signOut, user }) => {
        if (!user) {
          return (
            <div className="login-container">
              <h2>Login</h2>
            </div>
          );
        }
        return (
          <div className="page-container">
            <h1 className="h1">Editing Page</h1>
            <button className="sign-out-button" onClick={signOut}>Sign Out</button>

            <form onSubmit={handleSaveContent} className="editor-form">
              <label htmlFor="id">Enter ID:</label>
              <input
                id="id"
                className="input-field"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              
              <div style={{ marginTop: '20px' }}>
                <label htmlFor="content">Enter Content:</label>
                <ReactQuill
                  id="content"
                  className="quill-editor"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                />
              </div>
              
              <div className="button-container">
                <button type="submit" className={`submit-button ${isEditing ? 'edit-button' : 'save-button'}`}>
                  {isEditing ? 'Update Content' : 'Save Content'}
                </button>
              </div>
            </form>

            <h3>Saved Records:</h3>
            <ul className="record-list">
              {records.length > 0 ? (
                records.map((record) => (
                  <li key={record.id} className="record-item">
                    <button className="dropdown-button" onClick={() => toggleRecord(record.id)}>
                      <strong>ID:</strong> {record.id}
                      <span className="last-updated"> | Last Updated: {formatDate(record.lastUpdated)}</span>
                    </button>
                    {openRecord === record.id && (
                      <div className="dropdown-content">
                        <strong>Content:</strong> {record.content}
                        <button className="edit-button" onClick={() => handleEdit(record)}>Edit</button>
                        <button className="delete-button" onClick={() => handleDelete(record.id)}>Delete</button>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li>No records found.</li>
              )}
            </ul>
          </div>
        );
      }}
    </Authenticator>
  );
}

export default SimpleApiTest;
