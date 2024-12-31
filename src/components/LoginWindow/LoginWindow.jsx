import React, { useState } from 'react';
import { Auth } from '@aws-amplify/auth';
import styles from './LoginWindow.module.css';

const LoginWindow = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [email, setEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

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

  const handleSignUp = async (email, password, confirmPassword) => {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await Auth.signUp({ username: email, password });
      setEmail(email);
      setIsSignUp(false);
      setIsConfirming(true);
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
      setIsConfirming(false);
      setError('Account confirmed! You can now log in.');
    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Failed to confirm account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginWindow}>
      <h2 className={styles.title}>{isConfirming ? 'Confirm Sign-Up' : isSignUp ? 'Sign Up' : 'Login'}</h2>
      {!isConfirming ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const confirmPassword = e.target.confirmPassword?.value;

            if (isSignUp) {
              handleSignUp(email, password, confirmPassword);
            } else {
              handleSignIn(email, password);
            }
          }}
          className={styles.form}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            disabled={isSubmitting}
            className={styles.input}
          />
          <div className={styles.passwordContainer}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              disabled={isSubmitting}
              className={styles.input}
            />
            <span
              className={styles.togglePassword}
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? '🙈' : '👁️'}
            </span>
          </div>
          {isSignUp && (
            <div className={styles.passwordContainer}>
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                disabled={isSubmitting}
                className={styles.input}
              />
              <span
                className={styles.togglePassword}
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? '🙈' : '👁️'}
              </span>
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className={styles.button}>
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
          className={styles.form}
        >
          <input
            type="text"
            name="code"
            placeholder="Enter confirmation code"
            required
            disabled={isSubmitting}
            className={styles.input}
          />
          <button type="submit" disabled={isSubmitting} className={styles.button}>
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </button>
        </form>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
      <p className={styles.toggleText}>
        {isConfirming ? null : isSignUp ? (
          <>
            Already have an account?{' '}
            <button
              className={styles.toggleAuth}
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
              className={styles.toggleAuth}
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
