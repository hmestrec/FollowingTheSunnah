import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './contentpage.css'; // Import your custom CSS for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContentPage = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [content, setContent] = useState(""); // State to hold the content
  const [errorMessage, setErrorMessage] = useState(""); // State to hold any error messages

  // Function to fetch content based on ID
  const fetchContent = async () => {
    try {
      const encodedId = encodeURIComponent(id); // Encode the ID for the URL
      const apiUrl = `https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor/${encodedId}`;
  
      console.log("Fetching content based on the provided ID..."); // General log message
  
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setContent(data.content); // Set the content if found
      } else {
        const errorText = await response.text();
        setErrorMessage("Content not found. Please ensure the link is correct.");
        toast.error(`Content not found. Status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setErrorMessage("Error fetching content.");
      toast.error("Error fetching content.");
    }
  };
  

  // Fetch content on component mount
  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  return (
    <main>
      <h1 className="content-title">{decodeURIComponent(id)}</h1> {/* Decode the ID for display */}
      {errorMessage ? (
        <p className="error-message">{errorMessage}</p> // Display error message if any
      ) : (
        <div
          className="content-display" // Optional: Add a class for styling
          dangerouslySetInnerHTML={{ __html: content || "Loading content..." }} // Display fetched content
        />
      )}
      <ToastContainer />
    </main>
  );
};

export default ContentPage;
