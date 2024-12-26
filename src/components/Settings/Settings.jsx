import React, { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import styles from "./Settings.module.css";

const Settings = () => {
  const { darkMode, autoMode, toggleDarkMode, toggleAutoMode } = useContext(ThemeContext);

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
    </div>
  );
};

export default Settings;
