import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { ToastContainer, toast } from 'react-toastify';
import awsconfig from '../aws-exports'; // Import aws-exports.js
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';

const EditingPage = ({ user, signOut }) => {
    const [content, setContent] = useState('');
    const [id, setId] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [category, setCategory] = useState('Journey');
    const [isEditing, setIsEditing] = useState(false);
    const [records, setRecords] = useState([]);
    const [openRecord, setOpenRecord] = useState(null);
    const [editingRecordId, setEditingRecordId] = useState(null);

    // Safeguard for user email
    const userEmail = user?.attributes?.email || user?.email || 'Unknown User';

    // Fetch the editorAPI endpoint from aws-exports.js
    const editorAPI = awsconfig.aws_cloud_logic_custom.find(api => api.name === 'editorAPI')?.endpoint;

    if (!editorAPI) {
        console.error('editorAPI endpoint not found in aws-exports.js');
    }

    const fetchRecords = async () => {
        try {
            const response = await fetch(`${editorAPI}/editor`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            } else {
                toast.error('Failed to fetch records');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            toast.error('Error fetching records');
        }
    };

    const handleSaveContent = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${editorAPI}/editor/${id}`
            : `${editorAPI}/editor`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, content, status, category, userId: userEmail }),
            });
            if (response.ok) {
                toast.success(isEditing ? 'Content updated successfully!' : 'Content saved successfully!');
                setIsEditing(false);
                clearForm();
                fetchRecords();
            } else {
                toast.error('Failed to save content');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Error saving content');
        }
    };

    const handleDelete = async (recordId) => {
        try {
            const response = await fetch(`${editorAPI}/editor/${recordId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                toast.success('Record deleted successfully!');
                fetchRecords();
            } else {
                toast.error('Failed to delete record');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Error deleting record');
        }
    };

    const handleEdit = (record) => {
        setId(record.id);
        setContent(record.content);
        setStatus(record.status);
        setCategory(record.category);
        setIsEditing(true);
        setEditingRecordId(record.id);
    };

    const clearForm = () => {
        setId('');
        setContent('');
        setStatus('In Progress');
        setCategory('Journey');
        setIsEditing(false);
        setEditingRecordId(null);
    };

    const toggleRecord = (recordId) => {
        setOpenRecord(openRecord === recordId ? null : recordId);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not Available';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Filter records based on their status
    const inProgressRecords = records.filter(record => record.status === 'In Progress');
    const readyRecords = records.filter(record => record.status === 'Ready');

    return (
        <div className="editing-page">
            <h1 className="h1">Editing Page</h1>
            <h2>Welcome, {userEmail}!</h2>
            <button className="sign-out-button" onClick={signOut}>Sign Out</button>

            <form onSubmit={handleSaveContent} className="editor-form">
                <label htmlFor="id">Enter ID:</label>
                <input
                    id="id"
                    className="input-field"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={isEditing}
                />

                <div style={{ marginTop: '20px' }}>
                    <label htmlFor="content">Enter Content:</label>
                    <ReactQuill
                        id="content"
                        className="quill-editor"
                        value={content}
                        onChange={setContent}
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
                    <button type="button" className="clear-button" onClick={clearForm}>
                        Clear
                    </button>
                </div>
            </form>

            <h3>In Progress Records:</h3>
            <ul className="record-list">
                {inProgressRecords.map((record) => (
                    <li key={record.id} className="record-item">
                        <button className="dropdown-button" onClick={() => toggleRecord(record.id)}>
                            <strong>ID:</strong> {record.id}
                            <span className="last-updated"> | Last Updated: {formatDate(record.lastUpdated)}</span>
                        </button>
                        {openRecord === record.id && (
                            <div className="dropdown-content">
                                <strong>Content:</strong> {record.content}
                                <button className="edit-button" onClick={() => handleEdit(record)}>
                                    Edit
                                </button>
                                <button className="delete-button" onClick={() => handleDelete(record.id)}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Ready Records:</h3>
            <ul className="record-list">
                {readyRecords.map((record) => (
                    <li key={record.id} className="record-item">
                        <button className="dropdown-button" onClick={() => toggleRecord(record.id)}>
                            <strong>ID:</strong> {record.id}
                            <span className="last-updated"> | Last Updated: {formatDate(record.lastUpdated)}</span>
                        </button>
                        {openRecord === record.id && (
                            <div className="dropdown-content">
                                <strong>Content:</strong> {record.content}
                                <button className="edit-button" onClick={() => handleEdit(record)}>
                                    Edit
                                </button>
                                <button className="delete-button" onClick={() => handleDelete(record.id)}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <ToastContainer />
        </div>
    );
};

export default EditingPage;
