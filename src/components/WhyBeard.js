import React, { useEffect, useState } from "react";

const WhyBeard = () => {
  const [content, setContent] = useState(""); // State to hold the content

  // Function to fetch content from the database
  const fetchContent = async () => {
    try {
      const apiUrl = "https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor"; // Update with your actual endpoint
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const wakingUpEarlyContent = data.find(record => record.id === "WhyBeard"); // Replace with your actual ID
        if (wakingUpEarlyContent) {
          setContent(wakingUpEarlyContent.content); // Set the content if found
        } else {
          console.error("Content not found for WhyBeard.");
          setContent("Content not found."); // Fallback message
        }
      } else {
        console.error("Failed to fetch content:", response);
        setContent("Failed to fetch content.");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setContent("Error fetching content.");
    }
  };

  // Fetch content on component mount
  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <main>
      <h1>WhyBeard</h1>
      <p>{content || "Loading content..."}</p> {/* Display fetched content or loading message */}
    </main>
  );
};

export default WhyBeard;
