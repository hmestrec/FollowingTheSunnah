import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Homepage.css";


const prayerOrder = ["Fajr","Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Lastthird"];

const HomePage = () => {
  const [currentMessage, setCurrentMessage] = useState({ arabic: "Loading...", english: "Loading..." });
  const [prayerTimes, setPrayerTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchRandomVerse(); // Fetch a Quran verse on page load
    fetchPrayerTimes();

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

  const fetchRandomVerse = async () => {
    try {
      // Fetch the total number of surahs and verses
      const surahResponse = await fetch("https://api.alquran.cloud/v1/meta");
      const surahData = await surahResponse.json();
  
      if (!surahData || !surahData.data || !surahData.data.surahs.references) {
        throw new Error("Failed to fetch surah metadata.");
      }
  
      const surahs = surahData.data.surahs.references;
  
      // Pick a random surah
      const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
      const randomVerseNumber = Math.floor(Math.random() * randomSurah.numberOfAyahs) + 1;
  
      // Fetch the random verse details
      const verseResponse = await fetch(
        `https://api.alquran.cloud/v1/ayah/${randomSurah.number}:${randomVerseNumber}/editions/quran-simple,en.sahih`
      );
      const verseData = await verseResponse.json();
  
      if (verseData.data && verseData.data.length === 2) {
        // Extract Arabic and English translations
        const arabic = verseData.data[0].text || "Arabic text unavailable.";
        const translation = verseData.data[1].text || "English translation unavailable.";
  
        const surahName = randomSurah.englishName || "Unknown Surah";
        const ayahNumber = randomVerseNumber;
  
        setCurrentMessage({
          arabic: arabic.trim(),
          english: `${translation.trim()} (Surah ${surahName}, Ayah ${ayahNumber})`,
        });
      } else {
        throw new Error("Invalid verse data structure");
      }
    } catch (error) {
      console.error("Error fetching Quran verse:", error);
      setCurrentMessage({
        arabic: "Error fetching Arabic verse.",
        english: "Error fetching English translation.",
      });
    }
  };
  
  useEffect(() => {
    fetchPrayerTimes();

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

  const calculateLastThird = (ishaTime, fajrTime) => {
    const [ishaHour, ishaMinute] = ishaTime.split(":").map(Number);
    const [fajrHour, fajrMinute] = fajrTime.split(":").map(Number);

    const ishaDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), ishaHour, ishaMinute);
    const fajrDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, fajrHour, fajrMinute);

    const nightDuration = fajrDate - ishaDate;
    const lastThirdTime = new Date(ishaDate.getTime() + (nightDuration * 2) / 3);

    return lastThirdTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
  
      let nextPrayerTime = null;
      for (let j = i + 1; j < prayerOrder.length; j++) {
        const nextPrayer = prayerOrder[j];
        const [nextHour, nextMinute] = prayerTimes[nextPrayer]?.split(":").map(Number) || [];
        if (nextHour !== undefined && nextMinute !== undefined) {
          nextPrayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextHour, nextMinute);
          break;
        }
      }
  
      // If no next prayer found, set nextPrayerTime to the end of the day
      nextPrayerTime = nextPrayerTime || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
      // Determine if the current time falls within this prayer's range
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
    <div className="center-container">
      <div id="homeContent" className="message-display">
        <h2>Daily Quran Verse</h2>
        <div className="quran-verse">
          <p className="arabic">{currentMessage.arabic}</p>
          <p className="english">{currentMessage.english}</p>
        </div>

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

        {/* Button to navigate to the comments page */}
        <button onClick={() => navigate('/Comments')} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1em' }}>
          Go to Comments
        </button>
        <button
          onClick={() => navigate('/muslim-businesses')}
          style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1em' }}
        >
          Support Muslim Businesses
        </button>
        <button
          onClick={() => navigate('/all-profiles')}
          style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1em' }}
        >
          Profiles
        </button>

       </div>
    </div>
  );
};

export default HomePage;
