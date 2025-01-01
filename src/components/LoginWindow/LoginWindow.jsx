import React, { useState } from "react";
import { Auth } from "@aws-amplify/auth";
import styles from "./LoginWindow.module.css";

const LoginWindow = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isMFARequired, setIsMFARequired] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [email, setEmail] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [resetStep, setResetStep] = useState(1);

  const handleSignIn = async (email, password) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await Auth.signIn(email, password);

      if (user.challengeName === "SOFTWARE_TOKEN_MFA") {
        setAuthenticatedUser(user); // Save user for MFA verification
        setIsMFARequired(true);
        setError("MFA required. Please enter your code.");
      } else {
        if (onLoginSuccess) onLoginSuccess(user);
        setError(null);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err.message || "Invalid login credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMFA = async (mfaCode) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const verifiedUser = await Auth.confirmSignIn(
        authenticatedUser,
        mfaCode,
        "SOFTWARE_TOKEN_MFA"
      );
      if (onLoginSuccess) onLoginSuccess(verifiedUser);
      setIsMFARequired(false);
      setAuthenticatedUser(null);
      setError(null);
    } catch (err) {
      console.error("MFA verification error:", err);
      setError(err.message || "Invalid MFA code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (email, password, confirmPassword) => {
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Auth.signUp({ username: email, password });
      setEmail(email);
      setIsSignUp(false);
      setIsConfirming(true);
      setError("Account created! Please check your email for the confirmation code.");
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message || "Failed to create an account.");
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
      setError("Account confirmed! You can now log in.");
    } catch (err) {
      console.error("Confirmation error:", err);
      setError(err.message || "Failed to confirm account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setError(null);
    if (!email) {
      setError("Email cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Auth.forgotPassword(email);
      setResetStep(2);
      setError("Password reset code sent! Check your email.");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to initiate password reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (code, newPassword) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      setIsResettingPassword(false);
      setResetStep(1);
      setError("Password reset successful! You can now log in.");
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginWindow}>
      <h2 className={styles.title}>
        {isMFARequired
          ? "Verify MFA"
          : isResettingPassword
          ? resetStep === 1
            ? "Forgot Password"
            : "Reset Password"
          : isConfirming
          ? "Confirm Sign-Up"
          : isSignUp
          ? "Sign Up"
          : "Login"}
      </h2>

      {isMFARequired ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyMFA(mfaCode);
          }}
          className={styles.form}
        >
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            required
            disabled={isSubmitting}
            className={styles.input}
          />
          <button type="submit" disabled={isSubmitting} className={styles.button}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      ) : isResettingPassword ? (
        resetStep === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              setEmail(email);
              handleForgotPassword(email);
            }}
            className={styles.form}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              className={styles.input}
            />
            <button type="submit" disabled={isSubmitting} className={styles.button}>
              {isSubmitting ? "Submitting..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = e.target.code.value;
              const newPassword = e.target.newPassword.value;
              handleResetPassword(code, newPassword);
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
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              required
              disabled={isSubmitting}
              className={styles.input}
            />
            <button type="submit" disabled={isSubmitting} className={styles.button}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )
      ) : isConfirming ? (
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
            {isSubmitting ? "Confirming..." : "Confirm"}
          </button>
        </form>
      ) : (
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
              type={passwordVisible ? "text" : "password"}
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
              {passwordVisible ? "🙈" : "👁️"}
            </span>
          </div>
          {isSignUp && (
            <div className={styles.passwordContainer}>
              <input
                type={confirmPasswordVisible ? "text" : "password"}
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
                {confirmPasswordVisible ? "🙈" : "👁️"}
              </span>
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className={styles.button}>
            {isSubmitting ? "Submitting..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {!isResettingPassword && (
        <p className={styles.toggleText}>
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                className={styles.toggleAuth}
                onClick={() => setIsSignUp(false)}
                disabled={isSubmitting}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
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
      )}
      {!isResettingPassword && !isSignUp && !isConfirming && (
        <button
          className={styles.toggleAuth}
          onClick={() => setIsResettingPassword(true)}
          disabled={isSubmitting}
        >
          Forgot Password?
        </button>
      )}
    </div>
  );
};

export default LoginWindow;
