import React, { useEffect, useState } from "react";
import './contentpage.css'; // Make sure to import your CSS file

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
        const whyBeardContent = data.find(record => record.id === "WhyBeard"); // Replace with your actual ID
        if (whyBeardContent) {
          setContent(whyBeardContent.content); // Set the content if found
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
      <h1 className="black-heading">Why Beard</h1>
      <div className="content" style={{ color: 'black' }} dangerouslySetInnerHTML={{ __html: content }} /> {/* Render fetched content as HTML */}
    </main>
  );
};

export default WhyBeard;
