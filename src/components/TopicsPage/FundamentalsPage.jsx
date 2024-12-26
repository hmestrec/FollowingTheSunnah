import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import awsmobile from "../../aws-exports";
import styles from "./CategoriesPage.module.css";

const FundamentalsPage = () => {
  const [fundamentalsTopics, setFundamentalsTopics] = useState([]);

  const apiUrl = awsmobile.aws_cloud_logic_custom.find(
    (api) => api.name === "editorAPI"
  )?.endpoint;

  const fetchFundamentalsTopics = async () => {
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
        const fundamentalsRecords = data.filter(
          (record) =>
            record.category?.toLowerCase() === "fundamentals" &&
            record.status?.toLowerCase() === "ready" // Filter by "Ready" status
        );
        setFundamentalsTopics(fundamentalsRecords);
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
    fetchFundamentalsTopics();
  }, []);

  return (
    <main className={styles.categoryPage}>
      <h1 className={styles.pageTitle}>Fundamentals Topics</h1>
      <ul className={styles.topicsList}>
        {fundamentalsTopics.length > 0 ? (
          fundamentalsTopics.map((topic, index) => (
            <li key={index} className={styles.topicItem}>
              <Link
                to={`/content/${topic.id}`}
                className={styles.topicLink}
              >
                {topic.id} {/* Display ID as the title */}
              </Link>
            </li>
          ))
        ) : (
          <p className={styles.noTopicsMessage}>
            No fundamentals topics found.
          </p>
        )}
      </ul>
    </main>
  );
};

export default FundamentalsPage;
