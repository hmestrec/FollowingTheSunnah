import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    const checkIfAdmin = async () => {
        try {
            const session = await Auth.currentSession();
            const groups = session.getAccessToken().decodePayload()['cognito:groups'] || [];
            console.log('User Groups:', groups);
            setIsAdmin(groups.includes('Admin'));
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    useEffect(() => {
        if (user) {
            checkIfAdmin();
        }
    }, [user]);

    return (
        <div className="login-container">
            <h1>Login</h1>
            <Authenticator>
                {({ user: currentUser, signOut }) => {
                    if (!user && currentUser) setUser(currentUser);

                    return currentUser ? (
                        <div>
                            <h2>Welcome, {currentUser.attributes?.email || 'User'}!</h2>
                            {!isAdmin && <p style={{ color: 'red', fontWeight: 'bold' }}>Admin Only</p>}
                            {isAdmin && (
                                <div>
                                    <button onClick={() => navigate('/editing')}>Go to Editing Page</button>
                                    <button onClick={() => navigate('/business-management')}>Manage Businesses</button>
                                </div>
                            )}
                            <button onClick={signOut}>Sign Out</button>
                        </div>
                    ) : (
                        <p>Please log in to continue.</p>
                    );
                }}
            </Authenticator>
        </div>
    );
};

export default LoginPage;
