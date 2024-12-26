import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );
  const [autoMode, setAutoMode] = useState(
    localStorage.getItem("autoMode") === "true" || false
  );

  // Save preferences in localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("autoMode", autoMode);

    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Auto mode: Update darkMode based on sunrise/sunset
  useEffect(() => {
    if (autoMode) {
      const fetchSunriseSunset = async (latitude = 36.72016, longitude = -4.42034) => {
        try {
          const response = await fetch(
            `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&timezone=auto`
          );
          const data = await response.json();

          if (!data.results) throw new Error("No results in sunrise/sunset response");

          const now = new Date();
          const sunrise = new Date(`${data.results.date} ${data.results.sunrise}`);
          const sunset = new Date(`${data.results.date} ${data.results.sunset}`);
          const isDay = now >= sunrise && now <= sunset;

          setDarkMode(!isDay); // Switch to night mode if it's outside daytime range
        } catch (error) {
          console.error("Error fetching sunrise/sunset times:", error);
        }
      };

      const fetchLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              fetchSunriseSunset(latitude, longitude);
            },
            () => {
              console.warn("Could not fetch user location. Using default coordinates.");
              fetchSunriseSunset(); // Default to Malaga, Spain
            }
          );
        } else {
          console.warn("Geolocation not supported. Using default coordinates.");
          fetchSunriseSunset(); // Default to Malaga, Spain
        }
      };

      fetchLocation();

      // Regularly re-check the time every minute
      const intervalId = setInterval(() => {
        fetchLocation();
      }, 60000);

      return () => clearInterval(intervalId); // Cleanup
    }
  }, [autoMode]);

  const toggleDarkMode = () => {
    setAutoMode(false); // Disable auto mode when toggling manually
    setDarkMode((prev) => !prev);
  };

  const toggleAutoMode = () => {
    setAutoMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{ darkMode, autoMode, toggleDarkMode, toggleAutoMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
