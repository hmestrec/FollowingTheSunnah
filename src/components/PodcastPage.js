import React from "react";
import './PodcastPage.css';


const PodcastPage = () => {
  return (
    <main>
      <h1 className="podcast-title">Podcast Episodes</h1>
      <div class="podcast-button-container">
      <a href="https://youtu.be/moD6FxZu-K8?si=3G5HJtvZGOAVQ_N2" target="_blank" rel="noreferrer">
        <span className="Podcast-button">Episode 1</span>
      </a>
      <a href="https://link-to-episode-2.com" target="_blank" rel="noreferrer">
        <span className="Podcast-button">Episode 2</span>
      </a>
      <a href="https://link-to-episode-3.com" target="_blank" rel="noreferrer">
        <span className="Podcast-button">Episode 3</span>
      </a>
      </div>
    </main>
  );
};

export default PodcastPage;
