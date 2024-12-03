import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../aws-exports';

const MuslimBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const getApiUrl = () => {
    const apiUrl = awsconfig.aws_cloud_logic_custom.find(
      (api) => api.name === 'businessAPI'
    )?.endpoint;

    if (!apiUrl) {
      console.error("businessAPI endpoint not found in aws-exports.js");
    }
    return apiUrl;
  };

  const fetchBusinesses = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/businesses`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched businesses:', data); // Log the fetched data
        setBusinesses(data);
      } else {
        const errorText = await response.text();
        console.error(`Failed to fetch businesses: ${response.status} ${errorText}`);
        setError(`Failed to fetch businesses: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('Error fetching businesses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Support Muslim Businesses</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : businesses.length > 0 ? (
        <ul>
          {businesses.map((business) => (
            <li key={business.id}>
              <strong>{business.name}</strong> - {business.location} ({business.contact})
            </li>
          ))}
        </ul>
      ) : (
        <p>No businesses found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default MuslimBusinesses;