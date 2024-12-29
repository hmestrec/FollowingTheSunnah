import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";
import awsmobile from "../../aws-exports";
import styles from "./TopicsPage.module.css";

const TopicsPage = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(
    (api) => api.name === "editorAPI"
  )?.endpoint;

  // Fetch records from the API
  const fetchRecords = async () => {
    if (!apiUrl) {
      console.error("API URL not found in aws-exports.js");
      alert("Failed to find the API URL.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/editor`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  // Handle live search
  const handleSearch = (e) => {
    const query = e.target.value.trim().toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]); // Show no records if the search box is empty
      return;
    }

    const results = records.filter((record) => {
      const normalizedId = record.id?.toLowerCase() || "";
      const normalizedTitle = record.title?.toLowerCase() || "";

      return (
        normalizedId.includes(query) || normalizedTitle.includes(query)
      );
    });

    setSearchResults(results);
  };

  return (
    <main
      className={`${styles.topicsPage} ${
        darkMode ? styles.nightMode : styles.dayMode
      }`}
    >
      <h1 className={styles.topicsTitle}>Topics</h1>

      {/* Search Bar */}
      <div className={styles.searchWindow}>
        <form
          onSubmit={(e) => e.preventDefault()} // Prevent default form submission
          className={styles.searchForm}
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </form>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 ? (
          <div className={styles.searchResults}>
            {searchResults.map((record) => (
              <div key={record.id} className={styles.searchResultItem}>
                <span>{record.title || record.id}</span>
                <button
                  onClick={() => navigate(`/content/${record.id}`)}
                  className={styles.searchResultButton}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <p className={styles.noResults}>
            No topics found matching "{searchQuery}".
          </p>
        ) : null}
      </div>

      {/* Category Buttons */}
      <div className={styles.topicsButtonsContainer}>
        <Link to="/journey" className={styles.topicsButton}>
          Journey
        </Link>
        <Link to="/fundamentals" className={styles.topicsButton}>
          Fundamentals
        </Link>
        <Link to="/pathways" className={styles.topicsButton}>
          Pathways
        </Link>
      </div>
    </main>
  );
};

export default TopicsPage;
