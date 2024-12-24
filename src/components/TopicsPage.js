import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import awsmobile from "../aws-exports";
import "./TopicsPage.css";

const TopicsPage = () => {
  const [records, setRecords] = useState([]);
  const { darkMode } = useContext(ThemeContext);

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(
    (api) => api.name === "editorAPI"
  )?.endpoint;

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
        const readyRecords = data.filter(
          (record) => record.status?.toLowerCase() === "ready"
        );
        setRecords(readyRecords);
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
    fetchRecords();
  }, []);

  return (
    <main className={`topics-page ${darkMode ? "night-mode" : "day-mode"}`}>
      <h1 className="topics-title">Topics</h1>
      <div className="topics-buttons-container">
        <Link to="/journey" className="topics-button">Journey</Link>
        <Link to="/fundamentals" className="topics-button">Fundamentals</Link>
        <Link to="/pathways" className="topics-button">Pathways</Link>
      </div>
    </main>
  );
};

export default TopicsPage;
