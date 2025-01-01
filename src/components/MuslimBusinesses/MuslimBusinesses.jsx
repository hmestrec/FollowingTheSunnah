import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import awsconfig from '../../aws-exports';
import styles from './MuslimBusinesses.module.css';

const MuslimBusinesses = () => {
  const [businesses, setBusinesses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapAddress, setMapAddress] = useState(''); // Address for the map
  const [isMapVisible, setIsMapVisible] = useState(false); // Toggle map visibility
  const [hiddenCategories, setHiddenCategories] = useState([]); // Track hidden categories

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

        // Group businesses by category
        const groupedBusinesses = data.reduce((acc, business) => {
          const { category } = business;
          if (!acc[category]) acc[category] = [];
          acc[category].push(business);
          return acc;
        }, {});

        setBusinesses(groupedBusinesses);
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

  const toggleCategory = (category) => {
    setHiddenCategories((prevHiddenCategories) =>
      prevHiddenCategories.includes(category)
        ? prevHiddenCategories.filter((cat) => cat !== category)
        : [...prevHiddenCategories, category]
    );
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
    <div className={styles.businessContainer}>
      <h1 className={styles.title}>Support Muslim Businesses</h1>

      {loading ? (
        <div className={styles.loading}>Loading businesses...</div>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : Object.keys(businesses).length > 0 ? (
        <>
          {Object.keys(businesses).map((category) => (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader} onClick={() => toggleCategory(category)}>
                <h2 className={styles.categoryTitle}>{category}</h2>
                <button className={styles.toggleButton}>
                  {hiddenCategories.includes(category) ? 'Show' : 'Hide'}
                </button>
              </div>

              {!hiddenCategories.includes(category) && (
                <div className={styles.businessGallery}>
                  {businesses[category].map((business) => (
                    <div key={business.id} className={styles.businessCard}>
                      <h3 className={styles.businessName}>{business.name}</h3>
                      <p><strong>Location:</strong> {business.location}</p>
                      <p><strong>Contact:</strong> {business.contact}</p>
                      <button
                        className={styles.mapButton}
                        onClick={() => handleToggleMap(business.location)}
                      >
                        {isMapVisible && mapAddress === business.location
                          ? 'Hide Map'
                          : 'View on Map'}
                      </button>

                      {isMapVisible && mapAddress === business.location && (
                        <div className={styles.mapContainer}>
                          <iframe
                            title="Google Maps"
                            width="100%"
                            height="300"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                              mapAddress
                            )}&output=embed`}
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <p className={styles.noData}>No businesses found.</p>
      )}
    </div>
  );
};

export default MuslimBusinesses;
