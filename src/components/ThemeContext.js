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
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('autoMode', autoMode);
  }, [autoMode]);

  useEffect(() => {
    if (autoMode) {
      const fetchSunriseSunset = async (lat = 36.72016, lng = -4.42034) => {
        try {
          const response = await fetch(
            `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&timezone=auto`
          );
          const data = await response.json();

          if (!data.results) throw new Error('No results in response');

          const now = new Date();
          const sunriseTime = new Date(`${data.results.date} ${data.results.sunrise}`);
          const sunsetTime = new Date(`${data.results.date} ${data.results.sunset}`);
          const isDay = now >= sunriseTime && now <= sunsetTime;

          setIsDaytime(isDay);
          setDarkMode(!isDay);
        } catch (error) {
          console.error('Error fetching sunrise/sunset:', error);
          // Fallback to manual mode if auto mode fails
          setAutoMode(false);
        }
      };

      const fetchUserLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              fetchSunriseSunset(latitude, longitude);
            },
            () => {
              console.error('Failed to fetch user location. Using default.');
              fetchSunriseSunset();
            }
          );
        } else {
          console.error('Geolocation is not supported by this browser.');
          fetchSunriseSunset();
        }
      };

      fetchUserLocation();
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
