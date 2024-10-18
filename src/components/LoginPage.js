import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp } from '@aws-amplify/auth'; // Import methods from Amplify

const LoginPage = () => {
  const [username, setUsername] = useState(''); // Manage email locally
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-up and login
  const [isVerification, setIsVerification] = useState(false); // Toggle for verification form
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSignUp) {
    // Handle sign-up
    try {
      await signUp({
        username, // Using email as username for sign-up
        password,
        attributes: { email: username }, // Ensure you're passing the correct attribute
      });
      setMessage('Sign-up successful. Please check your email for verification.');
      setError('');
      setIsVerification(true); // Show verification form after sign-up
    } catch (err) {
      console.error('Error signing up:', err);
      setError(`Sign-up failed: ${err.message}`);
    }
  } else {
    // Handle login
    try {
      await signIn(username, password);
      setMessage('Login successful.');
      setError('');
      // Handle successful login (e.g., redirect to dashboard)
    } catch (err) {
      console.error('Error signing in:', err);
      setError(`Login failed: ${err.message}`);
    }
  }
};

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      setError("Email is missing. Please sign up first.");
      return;
    }

    try {
      await confirmSignUp(username, verificationCode); // Use email for confirmation
      setMessage('Verification successful! You can now log in.');
      setIsVerification(false); // Hide verification form after success
      setIsSignUp(false); // Switch back to login
      setError('');
    } catch (err) {
      console.error('Error confirming sign-up:', err);
      setError(`Failed to verify code: ${err.message}`);
    }
  };

  return (
    <div className="login-container">
      <h1>{isVerification ? 'Verify Your Account' : isSignUp ? 'Sign Up' : 'Login'}</h1>
      {!isVerification ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Email</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Store email locally
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {message && <p style={{ color: 'green' }}>{message}</p>}
        </form>
      ) : (
        <form onSubmit={handleVerificationSubmit}>
          <div>
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verify</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {message && <p style={{ color: 'green' }}>{message}</p>}
        </form>
      )}

      {!isVerification && (
        <p>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)}>Login here</button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button onClick={() => setIsSignUp(true)}>Sign up here</button>
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default LoginPage;
