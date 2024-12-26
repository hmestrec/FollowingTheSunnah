import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@aws-amplify/auth';
import LoginWindow from '../LoginWindow/LoginWindow';
import awsconfig from '../../aws-exports'; // Ensure this is correctly imported at the top
import styles from "./LandingPage.module.css";

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
            <div className={styles.loginContainer}>
                <LoginWindow
                    onLoginSuccess={(currentUser) => {
                        setUser(currentUser);
                        checkIfAdmin(currentUser);
                    }}
                />
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <h2 className={styles.welcomeMessage}>
                Welcome, {user.attributes?.email || 'User'}!
            </h2>
            {isAdmin ? (
                <div className={styles.adminSection}>
                    <p className={styles.adminIndicator}>You are a Chief.</p>
                    <button className={styles.actionButton} onClick={() => navigate('/editing')}>
                        Go to Editing Page
                    </button>
                    <button className={styles.actionButton} onClick={() => navigate('/business-management')}>
                        Manage Businesses
                    </button>
                    <button className={styles.actionButton} onClick={() => navigate('/create-profile')}>
                        Create Profile
                    </button>
                </div>
            ) : (
                <div className={styles.userSection}>
                    <p className={styles.userIndicator}>
                        You are a regular user. You can create a profile.
                    </p>
                    <button className={styles.actionButton} onClick={() => navigate('/create-profile')}>
                        Create Profile
                    </button>
                </div>
            )}
            <button className={`${styles.signOutButton} ${styles.actionButton}`} onClick={handleSignOut}>
                Sign Out
            </button>
        </div>
    );
};

export default LoginPage;
