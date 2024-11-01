import React, { useState, useEffect } from 'react';
import '../App.css';

const SunMoon = () => {
  const [isDaytime, setIsDaytime] = useState(true);
  const [celestialPosition, setCelestialPosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);

  const updateCelestialPosition = () => {
    const celestialBodySize = 10; // Size of the sun/moon in vw units
    const x = Math.random() * (100 - celestialBodySize); // Use vw units
    const y = Math.random() * (100 - celestialBodySize); // Use vh units
    return { x, y };
  };

  useEffect(() => {
    const fetchSunriseSunset = async (latitude, longitude) => {
      try {
        const response = await fetch(`https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&timezone=auto`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Raw API Data:", data);

        const dateStr = data.results.date;
        const sunriseTimeStr = `${dateStr} ${data.results.sunrise}`;
        const sunsetTimeStr = `${dateStr} ${data.results.sunset}`;

        const sunriseTime = new Date(sunriseTimeStr);
        const sunsetTime = new Date(sunsetTimeStr);

        if (isNaN(sunriseTime) || isNaN(sunsetTime)) {
          console.error("Failed to parse sunrise or sunset times");
          return;
        }

        setSunrise(sunriseTime);
        setSunset(sunsetTime);

        const isDaytime = new Date() >= sunriseTime && new Date() <= sunsetTime;
        setIsDaytime(isDaytime);
      } catch (error) {
        console.error('Failed to fetch sunrise and sunset times:', error);
      }
    };

    const getLocationAndFetchSunriseSunset = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          fetchSunriseSunset(latitude, longitude);
        }, (error) => {
          console.error('Error getting location:', error);
          fetchSunriseSunset(36.7201600, -4.4203400);
        });
      } else {
        fetchSunriseSunset(36.7201600, -4.4203400);
      }
    };

    getLocationAndFetchSunriseSunset();
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());

      if (sunrise && sunset) {
        const isDaytime = now >= sunrise && now <= sunset;
        setIsDaytime(isDaytime);

        const newPosition = updateCelestialPosition();
        setCelestialPosition(newPosition);
      }
    };

    const interval = setInterval(updateCurrentTime, 5000); // Update position every 5 seconds for smoother movement
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  useEffect(() => {
    const generateStars = () => {
      const starsArray = Array.from({ length: 100 }).map(() => ({
        x: Math.random() * 100, // Use vw units
        y: Math.random() * 100, // Use vh units
        size: Math.random() * 1 + 0.5, // Use relative units
      }));
      setStars(starsArray);
    };

    if (!isDaytime) {
      generateStars();
    }
  }, [isDaytime]);

  return (
    <div className={`sun-moon-container ${isDaytime ? 'day-mode' : 'night-mode'}`}>
      <div className="sun-moon-path"></div>

      {!isDaytime && stars.map((star, index) => (
        <div
          key={index}
          className="star"
          style={{
            left: `${star.x}vw`,
            top: `${star.y}vh`,
            width: `${star.size}vw`,
            height: `${star.size}vw`,
          }}
        />
      ))}

      <div
        className={`celestial-body ${isDaytime ? 'sun' : 'moon full-moon'}`}
        style={{ left: `${celestialPosition.x}vw`, top: `${celestialPosition.y}vh`, transition: 'left 5s ease-in-out, top 5s ease-in-out' }}
      >
        <span className="time-remaining">{currentTime}</span>
      </div>
    </div>
  );
};

export default SunMoon;