import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../../aws-exports'; // Ensure this is correctly imported at the top
import styles from './BusinessManagement.module.css';

const BusinessManagement = () => {
    const [businesses, setBusinesses] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const getApiUrl = () => {
        const apiUrl = awsconfig.aws_cloud_logic_custom.find(
            (api) => api.name === 'businessAPI'
        )?.endpoint;

        if (!apiUrl) {
            console.error("businessAPI endpoint not found in aws-exports.js");
        }
        return apiUrl;
    };

    const fetchBusinesses = async () => {
        const apiUrl = getApiUrl();
        if (!apiUrl) return;

        try {
            const response = await fetch(`${apiUrl}/businesses`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setBusinesses(data);
            } else {
                console.error(`Failed to fetch businesses: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
        }
    };

    const handleSaveBusiness = async (e) => {
        e.preventDefault();
        const apiUrl = getApiUrl();
        if (!apiUrl) return;

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${apiUrl}/businesses/${id}` : `${apiUrl}/businesses`;

        const body = { id, name, location, contact };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                toast.success(isEditing ? 'Business updated' : 'Business added');
                setIsEditing(false);
                clearForm();
                fetchBusinesses();
            } else {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
        } catch (error) {
            toast.error(`Failed to save business: ${error.message}`);
        }
    };

    const handleDeleteBusiness = async (businessId) => {
        const apiUrl = getApiUrl();
        if (!apiUrl) return;

        try {
            const response = await fetch(`${apiUrl}/businesses/${businessId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Business deleted');
                fetchBusinesses();
            } else {
                toast.error('Failed to delete business');
            }
        } catch (error) {
            console.error('Error deleting business:', error);
            toast.error('Error deleting business');
        }
    };

    const handleEditBusiness = (business) => {
        setId(business.id);
        setName(business.name);
        setLocation(business.location);
        setContact(business.contact);
        setIsEditing(true);
    };

    const clearForm = () => {
        setId('');
        setName('');
        setLocation('');
        setContact('');
        setIsEditing(false);
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    return (
        <div className={styles.businessManagement}>
            <h1 className={styles.title}>Business Management</h1>
            <form onSubmit={handleSaveBusiness} className={styles.form}>
                <input
                    type="text"
                    placeholder="Business ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={isEditing}
                    className={styles.input}
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={styles.input}
                />
                <input
                    type="text"
                    placeholder="Contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className={styles.input}
                />
                <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.button}>
                        {isEditing ? 'Update Business' : 'Add Business'}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.cancelButton}`}
                            onClick={clearForm}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h2 className={styles.subTitle}>Business List</h2>
            <ul className={styles.list}>
                {businesses.map((business) => (
                    <li key={business.id} className={styles.listItem}>
                        <strong>{business.name}</strong> - {business.location} - {business.contact}
                        <div className={styles.actions}>
                            <button
                                className={styles.button}
                                onClick={() => handleEditBusiness(business)}
                            >
                                Edit
                            </button>
                            <button
                                className={`${styles.button} ${styles.deleteButton}`}
                                onClick={() => handleDeleteBusiness(business.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusinessManagement;
