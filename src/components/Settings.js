import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './Settings.css';

const Settings = () => {
  const { darkMode, autoMode, toggleDarkMode, toggleAutoMode } = useContext(ThemeContext);

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      {/* Manual Dark Mode Toggle */}
      <div className="settings-item">
        <h3>Manual Theme Toggle</h3>
        <button onClick={toggleDarkMode} className="toggle-button">
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      {/* Automatic Theme Based on Sunset/Sunrise */}
      <div className="settings-item">
        <h3>Auto Theme (Based on Sunrise & Sunset)</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={toggleAutoMode}
          />
          Enable Automatic Theme
        </label>
      </div>
    </div>
  );
};

export default Settings;
