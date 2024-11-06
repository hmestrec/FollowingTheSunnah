import React, { useState, useEffect } from "react";

const messages = [
  '"O you who believe, obey Allah and obey the Messenger..."',
  '"And whosoever fears Allah... He will make a way for him to get out..."',
  '"Verily, with hardship, there is relief."',
  '"Indeed, the prayer prohibits immorality and wrongdoing..."',
  '"And speak to people good [words]."'
];

// Define the order and include Lastthird
const prayerOrder = ["Fajr","Dhuhr", "Asr", "Maghrib", "Isha", "Sunrise","Lastthird"];

const HomePage = () => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState("");

  useEffect(() => {
    // Change message every 10 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage((prevMessage) => {
        const nextIndex = (messages.indexOf(prevMessage) + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 10000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    // Fetch initial prayer times
    fetchPrayerTimes();

    // Update clock every second and re-evaluate current prayer
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(clockInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      updateCurrentPrayer();
    }
  }, [currentTime, prayerTimes]);

  const fetchPrayerTimes = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`)
        .then(response => response.json())
        .then(data => {
          const times = data.data.timings;
          const lastThird = calculateLastThird(times.Isha, times.Fajr);
          setPrayerTimes({ ...times, Lastthird: lastThird });
          setHijriDate(convertToArabicNumerals(`${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`));
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching prayer times:", error);
          setLoading(false);
        });
    });
  };

// Calculate "Lastthird" of the night based on Isha and Fajr
const calculateLastThird = (ishaTime, fajrTime) => {
  const [ishaHour, ishaMinute] = ishaTime.split(":").map(Number);
  const [fajrHour, fajrMinute] = fajrTime.split(":").map(Number);

  const ishaDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), ishaHour, ishaMinute);
  const fajrDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, fajrHour, fajrMinute);

  const nightDuration = fajrDate - ishaDate;
  const lastThirdTime = new Date(ishaDate.getTime() + (nightDuration * 2) / 3);

  // Format to display in 24-hour format without AM/PM
  return lastThirdTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};


  // Helper function to format the time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Convert numbers to Arabic numerals
  const convertToArabicNumerals = (str) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const updateCurrentPrayer = () => {
    const now = new Date();
    let activePrayer = null;

    for (let i = 0; i < prayerOrder.length; i++) {
      const prayer = prayerOrder[i];
      const [hour, minute] = prayerTimes[prayer]?.split(":").map(Number) || [];
      if (hour === undefined || minute === undefined) continue;

      const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
      const nextPrayerTime = i < prayerOrder.length - 1
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...prayerTimes[prayerOrder[i + 1]].split(":").map(Number))
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);

      if (now >= prayerTime && now < nextPrayerTime) {
        activePrayer = prayer;
        break;
      }
    }

    setCurrentPrayer(activePrayer);
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      updateCurrentPrayer();
    }
  };

  return (
  <div class="center-container">
    <div id="homeContent" className="message-display">
      <h2>Daily</h2>
      <p id="dynamicMessage">{currentMessage}</p>

      <div className="clock-display">
        <div className="clock-time">{formatTime(currentTime)}</div>
        <div className="date-info" style={{ fontFamily: "Arial, sans-serif", fontSize: "1em", color: "#888", direction: "rtl" }}>
          {hijriDate}
        </div>
      </div>

      <div className="prayer-times-container">
        <div className="prayer-times">
          <h3>Prayer Times</h3>
          {loading ? (
            <p>Loading prayer times...</p>
          ) : (
            <table className="prayer-times-table">
              <thead>
                <tr>
                  <th>Salah</th>
                  <th>Adhan</th>
                </tr>
              </thead>
              <tbody>
                {prayerOrder.map(prayer => (
                  <tr key={prayer} className={prayer === currentPrayer ? "highlight" : ""}>
                    <td>{prayer}</td>
                    <td>{prayerTimes[prayer]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default HomePage;
