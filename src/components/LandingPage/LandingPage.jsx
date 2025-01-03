import React, { useState, useEffect } from 'react'; // Ensure useState and useEffect are imported
import { useNavigate } from 'react-router-dom';
import { Auth } from '@aws-amplify/auth';
import LoginWindow from '../LoginWindow/LoginWindow';
import awsconfig from '../../aws-exports'; // Ensure this is correctly imported at the top
import styles from './LandingPage.module.css';

Auth.configure(awsconfig);

const LandingPage = ({ setUser }) => {
    const navigate = useNavigate();
    const [user, setLocalUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const currentUser = await Auth.currentAuthenticatedUser();
                setLocalUser(currentUser);
                setUser(currentUser); // Update global user state
                checkIfAdmin(currentUser);
            } catch (error) {
                setLocalUser(null);
                setUser(null);
            }
        };

        fetchCurrentUser();
    }, [setUser]);

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
            setLocalUser(null);
            setUser(null); // Update global user state
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
                        setLocalUser(currentUser);
                        setUser(currentUser); // Update global user state
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

export default LandingPage;
