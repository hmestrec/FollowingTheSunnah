import React from "react";
import styles from "./PodcastPage.module.css";

const PodcastPage = () => {
  return (
    <main className={`${styles.podcastPage} ${styles.dayMode}`}>
      <h1 className={styles.podcastTitle}>Podcast Episodes</h1>
      <div className={styles.podcastButtonContainer}>
        <a
          href="https://youtu.be/moD6FxZu-K8?si=3G5HJtvZGOAVQ_N2"
          target="_blank"
          rel="noreferrer"
          className={styles.podcastButton}
        >
          Episode 1
        </a>
        <a
          href="https://link-to-episode-2.com"
          target="_blank"
          rel="noreferrer"
          className={styles.podcastButton}
        >
          Episode 2
        </a>
        <a
          href="https://link-to-episode-3.com"
          target="_blank"
          rel="noreferrer"
          className={styles.podcastButton}
        >
          Episode 3
        </a>
      </div>
    </main>
  );
};

export default PodcastPage;
