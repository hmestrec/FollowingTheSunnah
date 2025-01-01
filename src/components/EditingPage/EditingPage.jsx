import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { ToastContainer, toast } from 'react-toastify';
import { Auth } from '@aws-amplify/auth';
import awsconfig from '../../aws-exports';
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import styles from './EditingPage.module.css';

const EditingPage = ({ signOut }) => {
    const [content, setContent] = useState('');
    const [id, setId] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [category, setCategory] = useState('Journey');
    const [isEditing, setIsEditing] = useState(false);
    const [records, setRecords] = useState([]);
    const [openRecord, setOpenRecord] = useState(null);
    const [editingRecordId, setEditingRecordId] = useState(null);
    const [userEmail, setUserEmail] = useState('Loading...');

    const POLL_INTERVAL = 5000; // 5 seconds

    const fetchWithAuth = async (url, options = {}) => {
        try {
            const session = await Auth.currentSession();
            const token = session.getIdToken().getJwtToken();
    
            if (!token) throw new Error('JWT Token is missing');
    
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
    
            const response = await fetch(url, options);
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed: ${response.status} - ${errorText}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error in fetchWithAuth:', error.message || error);
            throw error;
        }
    };
    

    const handleUnauthorizedError = (error) => {
        if (error.message === 'Unauthorized') {
            toast.error('Session expired. Please log in again.');
            signOut();
        } else {
            toast.error(error.message || 'An error occurred.');
        }
    };

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const user = await Auth.currentAuthenticatedUser();
                setUserEmail(user.attributes.email || 'Email not available');
            } catch (error) {
                console.error('Error fetching user email:', error);
                setUserEmail('Failed to fetch email');
            }
        };

        fetchUserEmail();
    }, []);

    const editorAPI = awsconfig.aws_cloud_logic_custom.find((api) => api.name === 'editorAPI')?.endpoint;

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

    const unlockRecord = async (recordId) => {
        try {
          await fetchWithAuth(`${editorAPI}/editor/unlock/${encodeURIComponent(recordId)}`, {
            method: 'PUT',
            body: JSON.stringify({ userId: userEmail }),
          });
        } catch (error) {
          console.error('Error unlocking the record:', error);
          toast.error('Error unlocking the record.');
        }
      };
      

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && isEditing && id) {
                try {
                    await unlockRecord(id);
                    toast.info(`Record "${id}" has been unlocked due to inactivity.`);
                    clearForm();
                } catch (error) {
                    console.error('Error auto-unlocking the record:', error);
                }
            }
        };

        const handleBeforeUnload = async (event) => {
            if (isEditing && id) {
                event.preventDefault();
                await unlockRecord(id);
                toast.info(`Record "${id}" has been unlocked as you are leaving.`);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isEditing, id]);

    useEffect(() => {
        return () => {
            if (isEditing && id) {
                unlockRecord(id).catch((error) => console.error('Error unlocking the record on unmount:', error));
            }
        };
    }, [isEditing, id]);

    const handleSaveContent = async (e) => {
        e.preventDefault();
    
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${editorAPI}/editor/${encodeURIComponent(id)}` // Corrected for updating content
            : `${editorAPI}/editor`; // For creating new content
    
        try {
            const response = await fetchWithAuth(url, {
                method,
                body: JSON.stringify({
                    id,
                    content,
                    status,
                    category,
                    userId: userEmail,
                }),
            });
    
            toast.success(isEditing ? 'Content updated successfully!' : 'Content saved successfully!');
            setIsEditing(false);
            clearForm();
            fetchRecords();
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Failed to save content.');
        }
    };
    
    

    const handleEdit = async (record) => {
        try {
            await fetchWithAuth(`${editorAPI}/editor/edit/${encodeURIComponent(record.id)}`, {
                method: 'PUT',
                body: JSON.stringify({ userId: userEmail }), // Include userId in the body
            });
    
            setId(record.id);
            setContent(record.content);
            setStatus(record.status);
            setCategory(record.category);
            setIsEditing(true);
            toast.success('Record locked for editing.');
        } catch (error) {
            console.error('Error locking the record:', error);
            toast.error('Failed to lock the record.');
        }
    };
    

    const handleDelete = async (recordId) => {
        try {
            await fetchWithAuth(`${editorAPI}/editor/${recordId}`, {
                method: 'DELETE',
            });
            toast.success('Record deleted successfully!');
            fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            handleUnauthorizedError(error);
        }
    };

    const handleCancelEdit = async () => {
        try {
            if (id) {
                await unlockRecord(id);
            }
            clearForm();
            toast.info('Edit cancelled.');
        } catch (error) {
            console.error('Error unlocking the record:', error);
            toast.error('Error unlocking the record.');
        }
    };

    const clearForm = async () => {
        if (id) {
            await unlockRecord(id);
        }
        setId('');
        setContent('');
        setStatus('In Progress');
        setCategory('Journey');
        setIsEditing(false);
        setEditingRecordId(null);
    };

    const toggleRecord = (recordId) => {
        setOpenRecord((prevOpenRecord) => (prevOpenRecord === recordId ? null : recordId));
    };
    
    useEffect(() => {
        fetchRecords();

        const intervalId = setInterval(fetchRecords, POLL_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    const inProgressRecords = records.filter((record) => record.status === 'In Progress');
    const readyRecords = records.filter((record) => record.status === 'Ready');

    return (
        <div className={styles.editingPage}>
            <h1 className={styles.h1}>Editing Page</h1>
            <h2 className={styles.h2}>Welcome, {userEmail}!</h2>
            <form onSubmit={handleSaveContent} className={styles.editorForm}>
                <label htmlFor="id">Enter ID:</label>
                <input
                    id="id"
                    className={styles.inputField}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={isEditing}
                />

                <div style={{ marginTop: '20px' }}>
                    <label htmlFor="content">Enter Content:</label>
                    <ReactQuill
                        id="content"
                        className={styles.quillEditor}
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

                <div className={styles.buttonContainer}>
                    <button
                        type="submit"
                        className={`${styles.submitButton} ${
                            isEditing ? styles.editButton : styles.saveButton
                        }`}
                    >
                        {isEditing ? 'Update Content' : 'Save Content'}
                    </button>
                    <button
                        type="button"
                        className={styles.clearButton}
                        onClick={handleCancelEdit}
                    >
                        Clear
                    </button>
                </div>
            </form>

            <h3>In Progress Records:</h3>
            <ul className={styles.recordList}>
                {inProgressRecords.map((record) => (
                    <li key={record.id} className={styles.recordItem}>
                        <button className={styles.dropdownButton} onClick={() => toggleRecord(record.id)}>
                            <strong>ID:</strong> {record.id}
                            <span className={styles.lastUpdated}>
                                {' '}
                                | Last Updated: {new Date(record.lastUpdated).toLocaleString()}
                            </span>
                            {record.isBeingEdited && record.currentUserId && (
                                <span className={styles.editingStatus}>
                                    {' '}
                                    | Editing by: {record.currentUserId}
                                </span>
                            )}
                        </button>
                        {openRecord === record.id && (
                            <div className={styles.dropdownContent}>
                                <strong>Content:</strong> {record.content}
                                {!record.isBeingEdited && (
                                    <>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => handleEdit(record)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(record.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Ready Records:</h3>
            <ul className={styles.recordList}>
                {readyRecords.map((record) => (
                    <li key={record.id} className={styles.recordItem}>
                        <button className={styles.dropdownButton} onClick={() => toggleRecord(record.id)}>
                            <strong>ID:</strong> {record.id}
                            <span className={styles.lastUpdated}>
                                {' '}
                                | Last Updated: {new Date(record.lastUpdated).toLocaleString()}
                            </span>
                            {record.isBeingEdited && record.currentUserId && (
                                <span className={styles.editingStatus}>
                                    {' '}
                                    | Editing by: {record.currentUserId}
                                </span>
                            )}
                        </button>
                        {openRecord === record.id && (
                            <div className={styles.dropdownContent}>
                                <strong>Content:</strong> {record.content}
                                {!record.isBeingEdited && (
                                    <>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => handleEdit(record)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(record.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EditingPage;
