import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../aws-exports';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './LogIn.css';

Amplify.configure(awsconfig);

function SimpleApiTestContent({ user, signOut }) {
  const [content, setContent] = useState('');
  const [id, setId] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [category, setCategory] = useState('Journey');
  const [isEditing, setIsEditing] = useState(false);
  const [records, setRecords] = useState([]);
  const [openRecord, setOpenRecord] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const userEmail = user?.signInDetails?.loginId || 'User';

  useEffect(() => {
    fetchRecords();
    // Polling to fetch records every 5 seconds
    const interval = setInterval(() => {
      fetchRecords();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [user]);

  const fetchRecords = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/editor`;
      const response = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        console.error('Failed to fetch records:', response);
        toast.error('Failed to fetch records.');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Error fetching records.');
    }
  };

  const handleEdit = async (record) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/editor/edit/${record.id}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userEmail }),
      });
      if (response.ok) {
        setId(record.id);
        setContent(record.content);
        setStatus(record.status);
        setCategory(record.category);
        setIsEditing(true);
        setEditingRecordId(record.id);
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      toast.error(`Failed to mark content as being edited: ${error.message}`);
    }
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    const userId = userEmail;

    // Determine whether this is a new post (POST) or an update (PUT)
    const method = isEditing ? 'PUT' : 'POST';
    const apiUrl = isEditing
      ? `${process.env.REACT_APP_API_BASE_URL}/editor/${id}`
      : `${process.env.REACT_APP_API_BASE_URL}/editor`;

    // Construct the request body
    const body = JSON.stringify({ id, content, status, category, userId });

    try {

      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (response.ok) {
        toast.success('Content saved successfully!');
        setIsEditing(false);
        setEditingRecordId(null);
        await handleUnlockContent(id, userId); // Unlock asynchronously after saving
        setId(''); // Reset ID
        setContent(''); // Reset content
        setStatus('In Progress'); // Reset status
        setCategory('Journey'); // Reset category
        fetchRecords(); // Fetch the updated records immediately after saving
      } else {
        const errorText = await response.text();
        console.error(`Failed ${method} request. Status: ${response.status}, Error: ${errorText}`);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      toast.error(`Failed to save content: ${error.message}`);
    }
  };

  const handleClear = async () => {
    if (editingRecordId) {
      try {
        await handleUnlockContent(editingRecordId, userEmail);
        toast.success('Editing user cleared successfully.');
      } catch (error) {
        console.error('Error unlocking content during clear:', error);
        toast.error('Failed to unlock the content. Please try again.');
        return;
      }
    }

    // Reset state after unlocking
    setId('');
    setContent('');
    setStatus('In Progress');
    setCategory('Journey');
    setIsEditing(false);
    setEditingRecordId(null);

    // Fetch updated records to reflect changes in editing status
    fetchRecords();
  };

  const handleUnlockContent = async (id, userId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/editor/unlock/${id}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to unlock content:', error);
      throw error; // Re-throw error to be caught by the caller
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/editor/${recordId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Item deleted successfully!');
        fetchRecords(); // Fetch the updated records after deletion
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      toast.error(`Failed to delete item: ${error.message}`);
    }
  };

  const toggleRecord = (recordId) => {
    setOpenRecord(openRecord === recordId ? null : recordId);
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Not Available';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],  // Allows headers of sizes 1, 2, 3
      [{ 'font': [] }],                // Allows choosing different font styles
      [{ 'size': ['small', false, 'large', 'huge'] }], // Allows choosing font size
      [{ 'color': [] }, { 'background': [] }], // Font color and background color
      ['bold', 'italic', 'underline', 'strike'], // Formatting options
      [{ list: 'ordered' }, { list: 'bullet' }], // List options
      [{ align: [] }],                // Text alignment options
      ['link', 'image'],              // Add link and image options
      ['clean'],                      // Remove formatting
    ],
  };

  const handleSignOut = async () => {
    if (editingRecordId) {
      await handleUnlockContent(editingRecordId, userEmail);
    }
    // Clear all the state variables when signing out
    setContent('');
    setId('');
    setStatus('In Progress');
    setCategory('Journey');
    setIsEditing(false);
    setEditingRecordId(null);
    setOpenRecord(null);
    setRecords([]);
    // Call signOut to log out the user
    signOut();
  };

  return (
    <div className="page-container">
      <h1 className="h1">Editing Page</h1>
      <h2>Welcome, {userEmail}!</h2>
      <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>

      <form onSubmit={handleSaveContent} className="editor-form">
        <label htmlFor="id">Enter ID:</label>
        <input
          id="id"
          className="input-field"
          value={id}
          onChange={(e) => setId(e.target.value)} // Allow modifying the ID
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

        <label htmlFor="status">Select Status:</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="In Progress">In Progress</option>
          <option value="Ready">Ready</option>
        </select>

        <label htmlFor="category">Select Category:</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Journey">Journey</option>
          <option value="Fundamentals">Fundamentals</option>
          <option value="Pathways">Pathways</option>
        </select>

        <div className="button-container">
          <button type="submit" className={`submit-button ${isEditing ? 'edit-button' : 'save-button'}`}>
            {isEditing ? 'Update Content' : 'Save Content'}
          </button>
          <button type="button" className="clear-button" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>

      <h3>In Progress Content:</h3>
      <ul className="record-list">
        {records.filter(record => !record.status || record.status?.toLowerCase() === 'in progress').length > 0 ? (
          records.filter(record => !record.status || record.status?.toLowerCase() === 'in progress').map((record) => (
            <li key={record.id} className="record-item">
              <button 
                className="dropdown-button in-progress" 
                onClick={() => toggleRecord(record.id)}
              > 
                <strong>ID:</strong> {record.id}
                <span className="last-updated"> | Last Updated: {formatDate(record.lastUpdated)}</span>
                <span className="current-editor"> | Editing User: {record.currentUserId ? record.currentUserId : 'None'}</span>
              </button>
              {openRecord === record.id && (
                <div className="dropdown-content">
                  <strong>Content:</strong> {record.content}
                  {isEditing && editingRecordId !== record.id ? (
                    <p>This record is currently being edited by another user.</p>
                  ) : (
                    <>
                      <button className="edit-button" onClick={() => handleEdit(record)}>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDelete(record.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))
        ) : (
          <li>No records found.</li>
        )}
      </ul>

      <h3>Ready Content:</h3>
      <ul className="record-list">
        {records.filter(record => record.status?.toLowerCase() === 'ready').length > 0 ? (
          records.filter(record => record.status?.toLowerCase() === 'ready').map((record) => (
            <li key={record.id} className="record-item">
              <button 
                className="dropdown-button ready" 
                onClick={() => toggleRecord(record.id)}
              >
                <strong>ID:</strong> {record.id}
                <span className="last-updated"> | Last Updated: {formatDate(record.lastUpdated)}</span>
                <span className="current-editor"> | Editing User: {record.currentUserId ? record.currentUserId : 'None'}</span>
              </button>
              {openRecord === record.id && (
                <div className="dropdown-content">
                  <strong>Content:</strong> {record.content}
                  <button className="edit-button" onClick={() => handleEdit(record)}>
                    Edit
                  </button>
                </div>
              )}
            </li>
          ))
        ) : (
          <li>No records found.</li>
        )}
      </ul>

      <ToastContainer />
    </div>
  );
}

function SimpleApiTest() {
  return (
    <Authenticator hideDefault={true}>
      {({ signOut, user }) => (
        user ? <SimpleApiTestContent user={user} signOut={signOut} /> : (
          <div className="login-container">
            <h2>Login</h2>
          </div>
        )
      )}
    </Authenticator>
  );
}

export default SimpleApiTest;