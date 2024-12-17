import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../aws-exports';
import './MuslimBusinesses.css';

const MuslimBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapAddress, setMapAddress] = useState(''); // Address for the map
  const [isMapVisible, setIsMapVisible] = useState(false); // Toggle map visibility

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
        setBusinesses(data);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch businesses: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('Error fetching businesses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMap = (address) => {
    if (isMapVisible && mapAddress === address) {
      // Hide map if it's already visible
      setIsMapVisible(false);
      setMapAddress('');
    } else {
      // Show map with new address
      setMapAddress(address);
      setIsMapVisible(true);
    }
  };

  return (
    <div className="business-container">
      <h1 className="title">Support Muslim Businesses</h1>

      {loading ? (
        <div className="loading">Loading businesses...</div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : businesses.length > 0 ? (
        <>
          <div className="business-gallery">
            {businesses.map((business) => (
              <div key={business.id} className="business-card">
                <h2 className="business-name">{business.name}</h2>
                <p><strong>Location:</strong> {business.location}</p>
                <p><strong>Contact:</strong> {business.contact}</p>
                <button
                  className="map-button"
                  onClick={() => handleToggleMap(business.location)}
                >
                  {isMapVisible && mapAddress === business.location
                    ? 'Hide Map'
                    : 'View on Map'}
                </button>
              </div>
            ))}
          </div>

          {/* Google Maps Section */}
          {isMapVisible && (
            <div className="map-container">
              <h3>Business Location</h3>
              <iframe
                title="Google Maps"
                width="100%"
                height="400"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          )}
        </>
      ) : (
        <p className="no-data">No businesses found.</p>
      )}

      <ToastContainer />
    </div>
  );
};

export default MuslimBusinesses;
