import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import awsmobile from "../../aws-exports";
import styles from "./ContentPage.module.css";

// Configure AWS SDK for Polly API
const pollyApiUrl = awsmobile.aws_cloud_logic_custom.find(
  (api) => api.name === "PollyAPI"
)?.endpoint; // Polly API URL from AWS API Gateway

const ContentPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [isPaused, setIsPaused] = useState(false); // Track if paused
  const audioRef = useRef(null); // Create reference for audio control

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(
    (api) => api.name === "editorAPI"
  )?.endpoint; // Existing API to fetch content

  const fetchContent = async () => {
    if (!apiUrl) {
      toast.error("API URL not found. Please check your configuration.");
      setErrorMessage("API URL not found.");
      return;
    }

    try {
      const encodedId = encodeURIComponent(id);
      const url = `${apiUrl}/editor/${encodedId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      } else {
        toast.error("Content not found.");
        setErrorMessage("Content not found. Please ensure the link is correct.");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Error fetching content.");
      setErrorMessage("Error fetching content.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  const handlePollySpeech = async () => {
    if (!content) {
      toast.warn("No content available to read.");
      return;
    }

    const plainText = new DOMParser().parseFromString(content, "text/html").body.innerText.trim();

    if (!plainText) {
      toast.warn("The content is empty or invalid for reading.");
      return;
    }

    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch(`${pollyApiUrl}/polly-synthesize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: plainText, voiceId: "Stephen" }), // Default voice to Stephen
      });

      if (!response.ok) {
        throw new Error("Error fetching speech from Polly.");
      }

      const data = await response.json();
      const audioUrl = data.audioUrl;  // Base64 audio URL
      const audio = new Audio(audioUrl);

      // Set the reference to the audio object for control
      audioRef.current = audio;

      // Add event listeners for play, ended, and error
      audio.onplay = () => {
        setIsSpeaking(true);
        setIsPaused(false);  // Reset paused state when playing starts
        setIsLoading(false); // Reset loading state once speech starts
        startHighlighting();  // Start highlighting when speech starts
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setHighlightedText(""); // Clear the highlighted text when speech ends
        setIsPaused(false); // Reset the pause state when audio ends
      };

      audio.onerror = () => {
        toast.error("An error occurred during audio playback.");
        setIsSpeaking(false);
        setIsPaused(false);
        setIsLoading(false); // Reset loading state on error
      };

      // Start playing the audio
      audio.play();
    } catch (error) {
      console.error("Error with Polly:", error);
      toast.error("An error occurred during speech synthesis.");
      setIsSpeaking(false);
      setIsPaused(false);
      setIsLoading(false); // Reset loading state on error
    }
  };

  // Function to highlight text based on the audio playback
  const startHighlighting = () => {
    const plainText = new DOMParser().parseFromString(content, "text/html").body.innerText.trim();
    const words = plainText.split(" ");  // Split text into words
    const audio = audioRef.current;

    let currentWordIndex = 0;

    const highlightInterval = setInterval(() => {
      if (!audioRef.current) return;

      const currentTime = audio.currentTime;
      const totalDuration = audio.duration;

      // Calculate which word should be highlighted based on currentTime and audio duration
      const wordIndex = Math.floor((currentTime / totalDuration) * words.length);

      if (wordIndex < words.length && wordIndex !== currentWordIndex) {
        currentWordIndex = wordIndex;
        setHighlightedText(words.slice(0, wordIndex + 1).join(" "));
      }

      if (currentTime >= totalDuration) {
        clearInterval(highlightInterval);  // Clear the interval when audio ends
      }
    }, 100); // Update the highlight every 100ms

    audio.onended = () => clearInterval(highlightInterval);  // Clear the interval when audio ends
  };

  const handleStop = () => {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause(); // Stop the audio
      audioRef.current.currentTime = 0; // Reset audio to start
      setIsSpeaking(false); // Set speaking to false
      setIsPaused(false); // Reset pause state
      toast.info("Speech stopped.");
    } else {
      toast.warn("No speech to stop.");
    }
  };

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      // Pause the audio
      audioRef.current.pause();
      setIsPaused(true);
      toast.info("Speech paused.");
    } else if (isPaused) {
      // Resume the audio
      audioRef.current.play();
      setIsPaused(false);
      toast.info("Speech resumed.");
    } else {
      // Start speech if not speaking
      handlePollySpeech();
    }
  };

  return (
    <main className={styles.contentPage}>
      <h1 className={styles.contentTitle}>
        {decodeURIComponent(id)}
        <div className={styles.speechControls}>
          <button
            className={`${styles.speechButton} ${styles.pollyPlay}`}
            onClick={handlePlayPause}
            disabled={!content || isLoading}
          >
            {isLoading ? (
              <div className={styles.loadingSpinner}></div> // Show spinner while loading
            ) : isSpeaking ? (
              isPaused ? "Resume" : "Pause"
            ) : (
              "Play"
            )}
          </button>

          <button
            className={`${styles.speechButton} ${styles.stop}`}
            onClick={handleStop}
            disabled={!isSpeaking}
          >
            Stop
          </button>
        </div>
      </h1>

      {errorMessage ? (
        <p className={styles.errorMessage}>{errorMessage}</p>
      ) : (
        <div
          className={styles.contentDisplay}
          dangerouslySetInnerHTML={{
            __html: content
              ? content.replace(
                  highlightedText,
                  `<span class="${styles.highlight}">${highlightedText}</span>`
                )
              : "Loading content...",
          }}
        />
      )}
    </main>
  );
};

export default ContentPage;
