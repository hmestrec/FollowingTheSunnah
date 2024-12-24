import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import awsmobile from "../aws-exports";
import './CategoryPage.css'; // Import CSS for styling

const JourneyPage = () => {
  const [journeyTopics, setJourneyTopics] = useState([]);

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(api => api.name === "editorAPI")?.endpoint;

  const fetchJourneyTopics = async () => {
    if (!apiUrl) {
      console.error("API URL not found in aws-exports.js");
      alert("Failed to find the API URL.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/editor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const journeyRecords = data.filter(
          (record) => record.category?.toLowerCase() === "journey" &&
          record.status?.toLowerCase() === "ready" // Filter by "Ready" status
        );
        setJourneyTopics(journeyRecords);
      } else {
        console.error("Failed to fetch records:", response);
        alert("Failed to fetch records.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("Error fetching records.");
    }
  };

  useEffect(() => {
    fetchJourneyTopics();
  }, []);

  return (
    <main className="journey-page category-page">
      <h1>Journey Topics</h1>
      <ul className="journey-topics-list topics-list">
        {journeyTopics.length > 0 ? (
          journeyTopics.map((topic, index) => (
            <li key={index}>
              <Link to={`/content/${topic.id}`} className="journey-topic-link topic-link">
                {topic.id} {/* Display ID as the title */}
              </Link>
            </li>
          ))
        ) : (
          <p>No journey topics found.</p>
        )}
      </ul>
    </main>
  );
};

export default JourneyPage;
