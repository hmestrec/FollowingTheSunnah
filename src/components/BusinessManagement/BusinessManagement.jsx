import React, { useState, useEffect } from 'react';
import { Auth } from '@aws-amplify/auth'; // Import Amplify Auth
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../../aws-exports'; // Ensure this is correctly imported at the top
import styles from './BusinessManagement.module.css';

const BusinessManagement = () => {
    const [businesses, setBusinesses] = useState([]);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [category, setCategory] = useState('Food Truck'); // Default category
    const [isEditing, setIsEditing] = useState(false);
    const [editingBusinessId, setEditingBusinessId] = useState(null);

    const getApiUrl = () => {
        const apiUrl = awsconfig.aws_cloud_logic_custom.find(
            (api) => api.name === 'businessAPI'
        )?.endpoint;

        if (!apiUrl) {
            console.error("businessAPI endpoint not found in aws-exports.js");
        }
        return apiUrl;
    };

    const generateBusinessId = () => {
        return `BUS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
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

    const fetchWithAuth = async (url, options = {}) => {
        try {
            const session = await Auth.currentSession(); // Retrieve session from AWS Cognito
            const token = session.getIdToken().getJwtToken(); // Extract JWT token

            if (!token) {
                throw new Error('JWT Token is missing');
            }

            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`, // Add Authorization header
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

    const handleSaveBusiness = async (e) => {
        e.preventDefault();
        const apiUrl = getApiUrl();
        if (!apiUrl) return;

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${apiUrl}/businesses/${editingBusinessId}`
            : `${apiUrl}/businesses`;

        const body = {
            id: isEditing ? editingBusinessId : generateBusinessId(),
            name,
            location,
            contact,
            category,
        };

        try {
            await fetchWithAuth(url, {
                method,
                body: JSON.stringify(body),
            });
            toast.success(isEditing ? 'Business updated' : 'Business added');
            clearForm();
            fetchBusinesses();
        } catch (error) {
            toast.error(`Failed to save business: ${error.message}`);
        }
    };

    const handleDeleteBusiness = async (businessId) => {
        const apiUrl = getApiUrl();
        if (!apiUrl) return;

        try {
            await fetchWithAuth(`${apiUrl}/businesses/${businessId}`, {
                method: 'DELETE',
            });
            toast.success('Business deleted');
            fetchBusinesses();
        } catch (error) {
            console.error('Error deleting business:', error);
            toast.error('Failed to delete business');
        }
    };

    const handleEditBusiness = (business) => {
        setEditingBusinessId(business.id);
        setName(business.name);
        setLocation(business.location);
        setContact(business.contact);
        setCategory(business.category || 'Food Truck'); // Default category if missing
        setIsEditing(true);
    };

    const clearForm = () => {
        setName('');
        setLocation('');
        setContact('');
        setCategory('Food Truck'); // Reset category to default
        setIsEditing(false);
        setEditingBusinessId(null);
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
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.input}
                >
                    <option value="Food Truck">Food Truck</option>
                    <option value="Sit-in Restaurant">Sit-in Restaurant</option>
                    <option value="Tea and Coffee">Tea and Coffee</option>
                    <option value="Other">Other</option>
                </select>
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
                        <strong>{business.name}</strong> - {business.location} - {business.contact} - <em>{business.category}</em>
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
