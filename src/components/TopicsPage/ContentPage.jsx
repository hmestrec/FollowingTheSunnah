import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import awsmobile from "../../aws-exports";
import styles from "./ContentPage.module.css";

const ContentPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");
  const [utterance, setUtterance] = useState(null); // Track current utterance

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(
    (api) => api.name === "editorAPI"
  )?.endpoint;

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

  const handlePlayPauseResume = () => {
    if (!content) {
      toast.warn("No content available to read.");
      return;
    }

    const plainText = new DOMParser().parseFromString(content, "text/html").body.innerText.trim();

    if (!plainText) {
      toast.warn("The content is empty or invalid for reading.");
      return;
    }

    if (isSpeaking) {
      // If currently speaking, pause the speech
      speechSynthesis.pause();
      setIsSpeaking(false);
      setIsPaused(true);
      toast.info("Speech paused.");
    } else if (isPaused) {
      // If it's paused, resume the speech
      speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
      toast.info("Speech resumed.");
    } else {
      // Start speaking if not speaking or paused
      setIsSpeaking(true);
      setIsPaused(false);

      const newUtterance = new SpeechSynthesisUtterance(plainText);
      newUtterance.voice = speechSynthesis.getVoices().find((voice) => voice.lang === "en-US");
      newUtterance.lang = "en-US"; // Default language for English content
      newUtterance.rate = 1; // Normal speed
      newUtterance.pitch = 1; // Neutral pitch

      // Add event listener for when the speech reaches a boundary (i.e., word or sentence)
      newUtterance.onboundary = (event) => {
        const text = event.charIndex;
        setHighlightedText(plainText.slice(0, text));
      };

      newUtterance.onend = () => {
        setIsSpeaking(false);
        setHighlightedText(""); // Clear highlighted text when speech ends
      };
      newUtterance.onerror = (e) => {
        if (e.error === "interrupted") {
          console.log("Speech interrupted (expected).");
          return;
        }
        console.error("Speech error:", e);
        toast.error("An unexpected error occurred during speech synthesis.");
        setIsSpeaking(false);
        setHighlightedText(""); // Clear highlighted text on error
      };

      // Save the current utterance to resume later if needed
      setUtterance(newUtterance);

      speechSynthesis.speak(newUtterance);
    }
  };

  const handleStop = () => {
    if (speechSynthesis.speaking || speechSynthesis.paused) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlightedText(""); // Clear the highlighted text on stop
      toast.info("Speech stopped.");
    } else {
      toast.warn("No speech to stop.");
    }
  };

  return (
    <main className={styles.contentPage}>
      <h1 className={styles.contentTitle}>
        {decodeURIComponent(id)}
        <div className={styles.speechControls}>
          {/* Play/Pause/Resume Button */}
          <button
            className={`${styles.speechButton} ${styles.playPauseResume}`}
            onClick={handlePlayPauseResume}
            disabled={!content}
          >
            {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Play"}
          </button>

          {/* Stop Button */}
          <button
            className={`${styles.speechButton} ${styles.stop}`}
            onClick={handleStop}
            disabled={!isSpeaking && !isPaused}
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
