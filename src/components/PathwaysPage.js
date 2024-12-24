import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import awsmobile from "../aws-exports";
import './CategoryPage.css';

const PathwaysPage = () => {
  const [pathwaysTopics, setPathwaysTopics] = useState([]);

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(api => api.name === "editorAPI")?.endpoint;

  const fetchPathwaysTopics = async () => {
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
        const pathwaysRecords = data.filter(
          (record) => record.category?.toLowerCase() === "pathways" &&
          record.status?.toLowerCase() === "ready" // Filter by "Ready" status
        );
        setPathwaysTopics(pathwaysRecords);
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
    fetchPathwaysTopics();
  }, []);

  return (
    <main className="category-page">
      <h1>Pathways Topics</h1>
      <ul className="topics-list">
        {pathwaysTopics.length > 0 ? (
          pathwaysTopics.map((topic, index) => (
            <li key={index}>
              <Link to={`/content/${topic.id}`} className="topic-link">
                {topic.id} {/* Display ID as the title */}
              </Link>
            </li>
          ))
        ) : (
          <p>No pathways topics found.</p>
        )}
      </ul>
    </main>
  );
};

export default PathwaysPage;
