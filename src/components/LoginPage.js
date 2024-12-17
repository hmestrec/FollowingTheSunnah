import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@aws-amplify/auth';
import LoginWindow from './LoginWindow'; // Import the reusable component
import awsconfig from '../aws-exports';

// Configure Auth
Auth.configure(awsconfig);

const LoginPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const currentUser = await Auth.currentAuthenticatedUser();
                setUser(currentUser);
                checkIfAdmin(currentUser);
            } catch (error) {
                console.error('Error fetching current user:', error);
                setUser(null);
            }
        };

        fetchCurrentUser();
    }, []);

    const checkIfAdmin = async (currentUser) => {
        try {
            const session = await Auth.currentSession();
            const payload = session.getAccessToken().decodePayload();
            const groups = payload['cognito:groups'] || [];
            setIsAdmin(groups.includes('Admin'));
        } catch (error) {
            console.error('Error fetching user groups:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await Auth.signOut();
            setUser(null);
            setIsAdmin(false);
        } catch (error) {
            console.error('Sign-out error:', error);
        }
    };

    if (!user) {
        return (
            <div className="login-container">
                <LoginWindow onLoginSuccess={(currentUser) => {
                    setUser(currentUser);
                    checkIfAdmin(currentUser);
                }} />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h2>Welcome, {user.attributes?.email || 'User'}!</h2>
            {isAdmin ? (
                <div>
                    <p style={{ color: 'green', fontWeight: 'bold' }}>You are an Admin.</p>
                    <button onClick={() => navigate('/editing')}>Go to Editing Page</button>
                    <button onClick={() => navigate('/business-management')}>Manage Businesses</button>
                    <button onClick={() => navigate('/create-profile')}>Create Profile</button>
                </div>
            ) : (
                <div>
                    <p style={{ color: 'blue', fontWeight: 'bold' }}>
                        You are a regular user. You can create a profile.
                    </p>
                    <button onClick={() => navigate('/create-profile')}>Create Profile</button>
                </div>
            )}
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default LoginPage;
