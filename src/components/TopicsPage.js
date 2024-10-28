import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TopicsPage = () => {
  const [records, setRecords] = useState([]); // State to hold records fetched from the API
  const [motivationalOpen, setMotivationalOpen] = useState(false);
  const [educationalOpen, setEducationalOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);

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
        // Filter only records with status 'Ready'
        const readyRecords = data.filter(record => record.status?.toLowerCase() === 'ready');
        setRecords(readyRecords); // Set the filtered records to state
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

  // Separate records into different buckets based on category
  const motivationalTopics = records.filter(record => record.category?.toLowerCase() === 'journey');
  const educationalTopics = records.filter(record => record.category?.toLowerCase() === 'fundamentals');
  const otherTopics = records.filter(record => !motivationalTopics.includes(record) && !educationalTopics.includes(record));

  return (
    <main>
      <h1 className="podcast-title">Topics</h1>
      <div className="buckets-container">
        {/* Motivational Topics Bucket */}
        <div className="bucket">
          <button className="bucket-button" onClick={() => setMotivationalOpen(!motivationalOpen)}>
            Journey
          </button>
          {motivationalOpen && (
            <ul className="bucket-content">
              {motivationalTopics.length > 0 ? (
                motivationalTopics.map((record) => (
                  <li key={record.id}>
                    <Link to={`/content/${record.id}`} className="button-link-topics">
                      {record.id} {/* Display the ID as the topic */}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No Motivational Topics found.</li>
              )}
            </ul>
          )}
        </div>

        {/* Educational Topics Bucket */}
        <div className="bucket">
          <button className="bucket-button" onClick={() => setEducationalOpen(!educationalOpen)}>
            Fundamentals
          </button>
          {educationalOpen && (
            <ul className="bucket-content">
              {educationalTopics.length > 0 ? (
                educationalTopics.map((record) => (
                  <li key={record.id}>
                    <Link to={`/content/${record.id}`} className="button-link-topics">
                      {record.id} {/* Display the ID as the topic */}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No Educational Topics found.</li>
              )}
            </ul>
          )}
        </div>

        {/* Other Topics Bucket */}
        <div className="bucket">
          <button className="bucket-button" onClick={() => setOtherOpen(!otherOpen)}>
          Pathways
          </button>
          {otherOpen && (
            <ul className="bucket-content">
              {otherTopics.length > 0 ? (
                otherTopics.map((record) => (
                  <li key={record.id}>
                    <Link to={`/content/${record.id}`} className="button-link-topics">
                      {record.id} {/* Display the ID as the topic */}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No Other Topics found.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};

export default TopicsPage;