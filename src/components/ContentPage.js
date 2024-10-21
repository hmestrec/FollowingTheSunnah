import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './contentpage.css'; // Import your custom CSS for styling


const ContentPage = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [content, setContent] = useState(""); // State to hold the content
  const [errorMessage, setErrorMessage] = useState(""); // State to hold any error messages

  // Function to fetch content based on ID
  const fetchContent = async () => {
    try {
      const apiUrl = `https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor/${id}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Content:", data.content); // Log the fetched content for debugging
        setContent(data.content); // Set the content if found
      } else {
        setErrorMessage("Content not found."); // Fallback message
        console.error("Error fetching content:", response);
      }
    } catch (error) {
      setErrorMessage("Error fetching content.");
      console.error("Error fetching content:", error);
    }
  };

  // Fetch content on component mount
  useEffect(() => {
    fetchContent();
  }, [id]);

  return (
    <main>
      <h1 className="content-title">{id}</h1>
      {errorMessage ? (
        <p>{errorMessage}</p> // Display error message if any
      ) : (
        <div 
          className="content-display" // Optional: Add a class for styling
          dangerouslySetInnerHTML={{ __html: content || "Loading content..." }} // Display fetched content
        />
      )}
    </main>
  );
};

export default ContentPage;
