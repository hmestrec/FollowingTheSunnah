import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { ToastContainer, toast } from 'react-toastify';
import { Auth } from '@aws-amplify/auth';
import awsconfig from '../../aws-exports'; // Ensure this is correctly imported at the top
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import styles from './EditingPage.module.css'; // Import the CSS module


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

    // Fetch user email from Cognito
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

    const unlockRecord = async (recordId) => {
        try {
            await fetch(`${editorAPI}/editor/unlock/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            ? `${editorAPI}/editor/${id}`
            : `${editorAPI}/editor`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, content, status, category, userId: userEmail }),
            });

            if (response.ok) {
                await unlockRecord(id);
                toast.success(isEditing ? 'Content updated successfully!' : 'Content saved successfully!');
                setIsEditing(false);
                clearForm();
                fetchRecords();
            } else {
                toast.error('Failed to save content.');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Error saving content.');
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

    const handleEdit = async (record) => {
        if (record.isBeingEdited && record.currentUserId !== userEmail) {
            toast.error(`This record is currently being edited by ${record.currentUserId}.`);
            return;
        }
    
        try {
            const response = await fetch(`${editorAPI}/editor/edit/${record.id}`, {
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
                toast.success('Record locked for editing.');
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to lock the record.');
            }
        } catch (error) {
            console.error('Error locking the record:', error);
            toast.error('Error locking the record.');
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

    const handleSignOut = async () => {
        try {
            if (isEditing && id) {
                await unlockRecord(id);
            }
            signOut();
        } catch (error) {
            console.error('Error unlocking the record on logout:', error);
        }
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

        // Set up polling to fetch records every POLL_INTERVAL
        const intervalId = setInterval(fetchRecords, POLL_INTERVAL);

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []);

    const inProgressRecords = records.filter(record => record.status === 'In Progress');
    const readyRecords = records.filter(record => record.status === 'Ready');

    return (
        <div className={styles.editingPage}>
            <h1 className={styles.h1}>Editing Page</h1>
            <h2 className= {styles.h2}>Welcome, {userEmail}!</h2>
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
                    <button type="submit" className={`${styles.submitButton} ${isEditing ? styles.editButton : styles.saveButton}`}>
                        {isEditing ? 'Update Content' : 'Save Content'}
                    </button>
                    <button type="button" className={styles.clearButton} onClick={handleCancelEdit}>
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
                            <span className={styles.lastUpdated}> | Last Updated: {formatDate(record.lastUpdated)}</span>
                            {record.isBeingEdited && record.currentUserId && (
                                <span className={styles.editingStatus}> | Editing by: {record.currentUserId}</span>
                            )}
                        </button>
                        {openRecord === record.id && (
                            <div className={styles.dropdownContent}>
                                <strong>Content:</strong> {record.content}
                                {!record.isBeingEdited && (
                                    <>
                                        <button className={styles.editButton} onClick={() => handleEdit(record)}>
                                            Edit
                                        </button>
                                        <button className={styles.deleteButton} onClick={() => handleDelete(record.id)}>
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
                            <span className={styles.lastUpdated}> | Last Updated: {formatDate(record.lastUpdated)}</span>
                            {record.isBeingEdited && record.currentUserId && (
                                <span className={styles.editingStatus}> | Editing by: {record.currentUserId}</span>
                            )}
                        </button>
                        {openRecord === record.id && (
                            <div className={styles.dropdownContent}>
                                <strong>Content:</strong> {record.content}
                                {!record.isBeingEdited && (
                                    <>
                                        <button className={styles.editButton} onClick={() => handleEdit(record)}>
                                            Edit
                                        </button>
                                        <button className={styles.deleteButton} onClick={() => handleDelete(record.id)}>
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