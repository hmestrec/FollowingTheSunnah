import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TopicsPage = () => {
  const [records, setRecords] = useState([]); // State to hold records fetched from the API

  // Function to fetch all records from DynamoDB
  const fetchRecords = async () => {
    try {
      const apiUrl = 'https://i17il7jb0c.execute-api.us-east-1.amazonaws.com/dev/editor';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data); // Set the fetched records to state
      } else {
        console.error('Failed to fetch records:', response);
        alert('Failed to fetch records.');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      alert('Error fetching records.');
    }
  };

  // Fetch records on initial load
  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <main>
      <h1 className="podcast-title">Topics</h1>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            <Link to={`/content/${record.id}`} className="button-link-topics">
              {record.id} {/* Display the ID as the topic */}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default TopicsPage;
