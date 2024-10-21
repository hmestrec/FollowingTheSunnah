import React from "react";

const PodcastPage = () => {
  return (
    <main>
      <h1 className="podcast-title">Podcast Episodes</h1>
      <a href="https://youtu.be/moD6FxZu-K8?si=3G5HJtvZGOAVQ_N2" target="_blank" rel="noreferrer">
        <span className="Podcast-button">Episode 1</span>
      </a>
      <a href="https://link-to-episode-2.com" target="_blank" rel="noreferrer">
        <span className="Podcast-button">Episode 2</span>
      </a>
      <a href="https://link-to-episode-3.com" target="_blank" rel="noreferrer">
        <span className="Podcast-button">Episode 3</span>
      </a>
    </main>
  );
};

export default PodcastPage;
