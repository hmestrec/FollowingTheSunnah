import React, { useState } from 'react';
import { Auth } from '@aws-amplify/auth';
import './LoginWindow.css';

const LoginWindow = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null); // Error state
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign-Up
  const [isConfirming, setIsConfirming] = useState(false); // Confirmation step
  const [email, setEmail] = useState(''); // Email for sign-up or confirmation

  const handleSignIn = async (email, password) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await Auth.signIn(email, password);
      if (onLoginSuccess) onLoginSuccess(user);
      setError(null);
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Invalid login credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (email, password) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await Auth.signUp({ username: email, password });
      setEmail(email); // Save email for confirmation step
      setIsSignUp(false);
      setIsConfirming(true); // Move to confirmation step
      setError('Account created! Please check your email for the confirmation code.');
    } catch (err) {
      console.error('Sign-up error:', err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSignUp = async (email, code) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await Auth.confirmSignUp(email, code);
      setIsConfirming(false); // Move back to login
      setError('Account confirmed! You can now log in.');
    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Failed to confirm account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-window">
      <h2>{isConfirming ? 'Confirm Sign-Up' : isSignUp ? 'Sign Up' : 'Login'}</h2>
      {!isConfirming ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            if (isSignUp) {
              handleSignUp(email, password);
            } else {
              handleSignIn(email, password);
            }
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            disabled={isSubmitting}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isSignUp ? 'Signing up...' : 'Logging in...') : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const code = e.target.code.value;
            handleConfirmSignUp(email, code);
          }}
        >
          <input
            type="text"
            name="code"
            placeholder="Enter confirmation code"
            required
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        {isConfirming ? null : isSignUp ? (
          <>
            Already have an account?{' '}
            <button
              className="toggle-auth"
              onClick={() => {
                setIsSignUp(false);
                setIsConfirming(false);
              }}
              disabled={isSubmitting}
            >
              Log In
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              className="toggle-auth"
              onClick={() => setIsSignUp(true)}
              disabled={isSubmitting}
            >
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default LoginWindow;
