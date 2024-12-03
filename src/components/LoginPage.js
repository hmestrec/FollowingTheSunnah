import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';

const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <h1>Login</h1>
            <Authenticator>
                {({ user, signOut }) => (
                    user ? (
                        <div>
                            <h2>Welcome, {user.username}!</h2>
                            <button
                                onClick={() => navigate('/editing')}
                                style={{ margin: '10px', padding: '10px 20px', fontSize: '1em' }}
                            >
                                Go to Editing Page
                            </button>
                            <button
                                onClick={() => navigate('/business-management')}
                                style={{ margin: '10px', padding: '10px 20px', fontSize: '1em' }}
                            >
                                Manage Businesses
                            </button>
                            <button
                                onClick={signOut}
                                style={{ margin: '10px', padding: '10px 20px', fontSize: '1em' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <p>Please log in to continue.</p>
                    )
                )}
            </Authenticator>
        </div>
    );
};

export default LoginPage;
