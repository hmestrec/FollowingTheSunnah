import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp } from '@aws-amplify/auth'; // Import methods

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '', // Add email for sign-up
    verificationCode: '', // Add verification code for sign-up confirmation
  });
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign-up
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false); // State to toggle modal
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, email } = formData;

    if (isSignUp) {
      // Handle sign-up
      try {
        await signUp({
          username: email, // Use email as the username
          password,
          attributes: { email },
        });
        setMessage('Sign-up successful. Please check your email for verification.');
        setError('');
        setIsVerificationModalOpen(true); // Open the verification modal after sign-up
      } catch (err) {
        console.error('Error signing up:', err);
        setError('Failed to sign up. Please try again.');
      }
    } else {
      // Handle login
      try {
        const user = await signIn(username, password);
        console.log('Logged in user:', user);
        setMessage('Login successful.');
        setError('');
      } catch (err) {
        console.error('Error signing in:', err);
        setError('Failed to log in. Please try again.');
      }
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    const { email, verificationCode } = formData;

    try {
      // Confirm sign-up using email (as the username) and verification code
      await confirmSignUp(email, verificationCode); // Use the email as the username
      setMessage('Verification successful! You can now log in.');
      setIsVerificationModalOpen(false); // Close the modal after verification
      setIsSignUp(false); // Switch back to login after verification
      setError('');
    } catch (err) {
      console.error('Error confirming sign-up:', err);
      setError(`Failed to verify code: ${err.message}`);
    }
  };

  return (
    <div className="login-container">
      <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username (Email)</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
      </form>

      {/* Verification Modal */}
      {isVerificationModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Verify Your Account</h2>
            <form onSubmit={handleVerificationSubmit}>
              <div>
                <label htmlFor="username">Username (Email)</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.email} // Ensure email (username) is passed
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit">Verify</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default LoginPage;
