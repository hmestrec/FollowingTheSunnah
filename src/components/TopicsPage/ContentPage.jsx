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

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(
    (api) => api.name === "editorAPI"
  )?.endpoint;

  const fetchContent = async () => {
    if (!apiUrl) {
      console.error("API URL not found in aws-exports.js");
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
        const errorText = await response.text();
        setErrorMessage("Content not found. Please ensure the link is correct.");
        toast.error(`Content not found. Status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setErrorMessage("Error fetching content.");
      toast.error("Error fetching content.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  return (
    <main className={styles.contentPage}>
      <h1 className={styles.contentTitle}>{decodeURIComponent(id)}</h1>
      {errorMessage ? (
        <p className={styles.errorMessage}>{errorMessage}</p>
      ) : (
        <div
          className={styles.contentDisplay}
          dangerouslySetInnerHTML={{ __html: content || "Loading content..." }}
        />
      )}
      <ToastContainer />
    </main>
  );
};

export default ContentPage;
