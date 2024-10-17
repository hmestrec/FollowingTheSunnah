import React, { useState, useEffect } from "react";

const messages = [
  '"O you who believe, obey Allah and obey the Messenger..."',
  '"And whosoever fears Allah... He will make a way for him to get out..."',
  '"Verily, with hardship, there is relief."',
  '"Indeed, the prayer prohibits immorality and wrongdoing..."',
  '"And speak to people good [words]."'
];

const HomePage = () => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prevMessage) => {
        const nextIndex = (messages.indexOf(prevMessage) + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="homeContent">
      <p id="dynamicMessage">{currentMessage}</p>
    </div>
  );
};

export default HomePage;
