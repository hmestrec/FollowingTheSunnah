// src/components/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the ThemeContext
export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || false
  );
  const [autoMode, setAutoMode] = useState(
    localStorage.getItem('autoMode') === 'true' || false
  );
  const [isDaytime, setIsDaytime] = useState(true);

  useEffect(() => {
    if (autoMode) {
      const fetchSunriseSunset = async () => {
        try {
          // Replace with user's location if available
          const lat = 36.7201600;
          const lng = -4.4203400;

          const response = await fetch(
            `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&timezone=auto`
          );
          const data = await response.json();
          const dateStr = data.results.date;
          const sunriseTime = new Date(`${dateStr} ${data.results.sunrise}`);
          const sunsetTime = new Date(`${dateStr} ${data.results.sunset}`);

          const now = new Date();
          const isDay = now >= sunriseTime && now <= sunsetTime;
          setIsDaytime(isDay);

          if (isDay) {
            setDarkMode(false);
          } else {
            setDarkMode(true);
          }
        } catch (error) {
          console.error('Failed to fetch sunrise and sunset times:', error);
        }
      };

      fetchSunriseSunset();
    }
  }, [autoMode]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('night-mode');
      document.body.classList.remove('day-mode');
    } else {
      document.body.classList.add('day-mode');
      document.body.classList.remove('night-mode');
    }
  }, [darkMode]);
  

  const toggleDarkMode = () => {
    setAutoMode(false);
    setDarkMode((prev) => !prev);
  };

  const toggleAutoMode = () => {
    setAutoMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        autoMode,
        isDaytime,
        toggleDarkMode,
        toggleAutoMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
