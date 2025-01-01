import React, { useState, useEffect, useContext } from "react";
import { Auth } from "@aws-amplify/auth";
import { ThemeContext } from "../ThemeContext";
import styles from "./Settings.module.css";

const Settings = () => {
  const { darkMode, autoMode, toggleDarkMode, toggleAutoMode } = useContext(ThemeContext);
  const [isSettingUpMFA, setIsSettingUpMFA] = useState(false);
  const [totpSetup, setTotpSetup] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  // Function to dynamically check MFA status
  const checkMfaStatus = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const mfaType = await Auth.getPreferredMFA(user); // Fetch preferred MFA type
      //console.log("MFA Status:", mfaType); // Debugging log
      setIsMfaEnabled(mfaType === "SOFTWARE_TOKEN_MFA");
    } catch (err) {
      console.error("Error checking MFA status:", err);
      setIsMfaEnabled(false);
    }
  };

  // Fetch MFA status when the component mounts
  useEffect(() => {
    checkMfaStatus();
  }, []);

  // Function to set up TOTP
  const setupTotp = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await Auth.currentAuthenticatedUser();
      const code = await Auth.setupTOTP(user);

      const totpUrl = `otpauth://totp/${encodeURIComponent(
        `MyApp:${user.username}`
      )}?secret=${code}&issuer=MyApp`;

      setTotpSetup({ code, totpUrl });
      setError("Scan this QR code in your authenticator app and enter the code below.");
    } catch (err) {
      console.error("TOTP setup error:", err);
      setError("Failed to set up TOTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to verify TOTP
  const verifyTotp = async (totpCode) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.verifyTotpToken(user, totpCode);
      await Auth.setPreferredMFA(user, "TOTP");
      setIsSettingUpMFA(false);
      setTotpSetup(null);
      setError("MFA setup complete! You can now use it during login.");
      await checkMfaStatus(); // Refresh MFA status
    } catch (err) {
      console.error("Verify TOTP error:", err);
      setError("Failed to verify TOTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to disable MFA
  const disableMfa = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.setPreferredMFA(user, "NOMFA");
      setIsMfaEnabled(false); // Reflect the new status immediately
      setError("MFA has been disabled.");
      await checkMfaStatus(); // Refresh MFA status
    } catch (err) {
      console.error("Error disabling MFA:", err);
      setError("Failed to disable MFA. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.settingsTitle}>Settings</h1>

      {/* Manual Dark Mode Toggle */}
      <div className={styles.settingsItem}>
        <h3 className={styles.settingsSubtitle}>Manual Theme Toggle</h3>
        <button onClick={toggleDarkMode} className={styles.toggleButton}>
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      {/* Automatic Theme Toggle */}
      <div className={styles.settingsItem}>
        <h3 className={styles.settingsSubtitle}>Auto Theme (Based on Sunrise & Sunset)</h3>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            className={styles.toggleCheckbox}
            checked={autoMode}
            onChange={toggleAutoMode}
          />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      {/* MFA Setup */}
      <div className={styles.settingsItem}>
        <h3 className={styles.settingsSubtitle}>Multi-Factor Authentication (TOTP)</h3>
        {isMfaEnabled ? (
          <button
            onClick={disableMfa}
            disabled={isSubmitting}
            className={`${styles.toggleButton} ${styles.mfaEnabledButton}`}
          >
            {isSubmitting ? "Disabling..." : "Disable MFA"}
          </button>
        ) : isSettingUpMFA ? (
          <div className={styles.mfaSetup}>
            {totpSetup ? (
              <>
                <p>{error}</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                    totpSetup.totpUrl
                  )}&size=150x150`}
                  alt="TOTP QR Code"
                />
                <input
                  type="text"
                  placeholder="Enter TOTP Code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className={styles.input}
                />
                <button
                  onClick={() => verifyTotp(mfaCode)}
                  disabled={isSubmitting}
                  className={styles.toggleButton}
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </button>
              </>
            ) : (
              <button
                onClick={setupTotp}
                disabled={isSubmitting}
                className={styles.toggleButton}
              >
                {isSubmitting ? "Setting Up..." : "Set Up TOTP"}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsSettingUpMFA(true)}
            className={styles.toggleButton}
          >
            Enable MFA (TOTP)
          </button>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default Settings;
