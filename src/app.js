import './app.css';

// Change messages on home page periodically
const messages = [
    '"O you who believe, obey Allah and obey the Messenger..."',
    '"And whosoever fears Allah... He will make a way for him to get out..."',
    '"Verily, with hardship, there is relief."',
    '"Indeed, the prayer prohibits immorality and wrongdoing..."',
    '"And speak to people good [words]."'
];

let currentIndex = 0;
function changeMessage() {
    const messageElement = document.getElementById('dynamicMessage');
    currentIndex = (currentIndex + 1) % messages.length;
    messageElement.textContent = messages[currentIndex];
}
setInterval(changeMessage, 10000); // Change message every 10 seconds
