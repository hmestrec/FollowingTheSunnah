import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext"; // Import ThemeContext
import awsmobile from "../aws-exports"; // Import AWS exports
import './TopicsPage.css';

const TopicsPage = () => {
  const [records, setRecords] = useState([]); // State to hold records fetched from the API
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [fundamentalsOpen, setFundamentalsOpen] = useState(false);
  const [pathwaysOpen, setPathwaysOpen] = useState(false);
  const { darkMode } = useContext(ThemeContext); // Access the current theme state

  // Get the API URL dynamically
  const apiUrl = awsmobile.aws_cloud_logic_custom.find(api => api.name === "editorAPI")?.endpoint;

  // Function to fetch all records from DynamoDB
  const fetchRecords = async () => {
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
        // Filter only records with status 'Ready'
        const readyRecords = data.filter(record => record.status?.toLowerCase() === "ready");
        setRecords(readyRecords); // Set the filtered records to state
      } else {
        console.error("Failed to fetch records:", response);
        alert("Failed to fetch records.");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("Error fetching records.");
    }
  };

  // Fetch records on initial load
  useEffect(() => {
    fetchRecords();
  }, []);

  // Separate records into different buckets based on category
  const journeyTopics = records.filter(record => record.category?.toLowerCase() === "journey");
  const fundamentalsTopics = records.filter(record => record.category?.toLowerCase() === "fundamentals");
  const pathwaysTopics = records.filter(record => record.category?.toLowerCase() === "pathways");

  return (
    <main className={`topics-page ${darkMode ? "dark-mode" : "day-mode"}`}>
      <h1 className="podcast-title">Topics</h1>
      <div className="buckets-container">
        {/* Journey Topics Bucket */}
        <div className="bucket">
          <button className="bucket-button" onClick={() => setJourneyOpen(!journeyOpen)}>
            Journey
          </button>
          {journeyOpen && (
            <ul className="bucket-content">
              {journeyTopics.length > 0 ? (
                journeyTopics.map((record) => (
                  <li key={record.id}>
                    <Link to={`/content/${record.id}`} className="button-link-topics">
                      {record.id} {/* Display the ID as the topic */}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No Journey Topics found.</li>
              )}
            </ul>
          )}
        </div>

        {/* Fundamentals Topics Bucket */}
        <div className="bucket">
          <button className="bucket-button" onClick={() => setFundamentalsOpen(!fundamentalsOpen)}>
            Fundamentals
          </button>
          {fundamentalsOpen && (
            <ul className="bucket-content">
              {fundamentalsTopics.length > 0 ? (
                fundamentalsTopics.map((record) => (
                  <li key={record.id}>
                    <Link to={`/content/${record.id}`} className="button-link-topics">
                      {record.id} {/* Display the ID as the topic */}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No Fundamentals Topics found.</li>
              )}
            </ul>
          )}
        </div>

        {/* Pathways Topics Bucket */}
        <div className="bucket">
          <button className="bucket-button" onClick={() => setPathwaysOpen(!pathwaysOpen)}>
            Pathways
          </button>
          {pathwaysOpen && (
            <ul className="bucket-content">
              {pathwaysTopics.length > 0 ? (
                pathwaysTopics.map((record) => (
                  <li key={record.id}>
                    <Link to={`/content/${record.id}`} className="button-link-topics">
                      {record.id} {/* Display the ID as the topic */}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No Pathways Topics found.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};

export default TopicsPage;
