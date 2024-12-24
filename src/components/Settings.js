import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import "./Settings.css";

const Settings = () => {
  const { darkMode, autoMode, toggleDarkMode, toggleAutoMode } = useContext(ThemeContext);

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      {/* Manual Dark Mode Toggle */}
      <div className="settings-item">
        <h3 className="settings-subtitle">Manual Theme Toggle</h3>
        <button onClick={toggleDarkMode} className="toggle-button">
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      {/* Automatic Theme Toggle */}
      <div className="settings-item">
      <h3 className="settings-subtitle">Auto Theme (Based on Sunrise & Sunset)</h3>
      <div className="toggle-wrapper">
        <input
          type="checkbox"
          className="toggle-checkbox"
          checked={autoMode}
          onChange={(e) => {
            console.log('Toggle AutoMode Fired:', e.target.checked);
            toggleAutoMode();
          }}
        />
        <span className="toggle-slider"></span>
      </div>
    </div>
    </div>
  );
}

export default Settings;
