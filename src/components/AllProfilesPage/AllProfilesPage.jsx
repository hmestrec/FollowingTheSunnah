import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from '@aws-amplify/auth';
import awsExports from '../../aws-exports';
import styles from './AllProfilesPage.module.css';

const AllProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null); // For modal

  const getApiUrl = () => {
    const apiUrl = awsExports.aws_cloud_logic_custom.find(
      (api) => api.name === 'MarriageProfilesAPI'
    )?.endpoint;
    return apiUrl;
  };

  const fetchAllProfiles = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/profiles`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      } else {
        toast.error('Failed to fetch profiles.');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error fetching profiles.');
    }
  };

  const fetchUserDetails = async () => {
    try {
      const session = await Auth.currentSession();
      const payload = session.getAccessToken().decodePayload();
      const groups = payload['cognito:groups'] || [];

      setIsAdmin(groups.includes('Admin'));
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDeleteProfile = async (user_id, profile_id) => {
    const apiUrl = getApiUrl();
    if (!apiUrl || !isAdmin) {
      toast.error('Unauthorized action.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/profiles`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, profile_id }),
      });

      if (response.ok) {
        toast.success('Profile deleted successfully.');
        fetchAllProfiles();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to delete profile.'}`);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Error deleting profile.');
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchAllProfiles();
  }, []);

  return (
    <div className={styles.allProfilesContainer}>
      <h2 className={styles.title}>All Marriage Profiles</h2>
      <div className={styles.profilesGallery}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.profile_id} className={styles.profileCard}>
              <div className={styles.profileImage}>🌟</div>
              <div className={styles.profileDetails}>
                <h3 className={styles.profileName}>{profile.name}</h3>
                <p><strong>Age:</strong> {profile.age}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <button
                  className={styles.moreDetailsButton}
                  onClick={() => setSelectedProfile(profile)}
                >
                  More Details
                </button>
                {isAdmin && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteProfile(profile.user_id, profile.profile_id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noProfilesMessage}>No profiles found.</p>
        )}
      </div>

      {/* Modal for More Details */}
      {selectedProfile && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProfile(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.profileName}>{selectedProfile.name}</h3>
            <p><strong>Age:</strong> {selectedProfile.age}</p>
            <p><strong>Gender:</strong> {selectedProfile.gender}</p>
            <p><strong>Location:</strong> {selectedProfile.location}</p>
            <p><strong>Description:</strong> {selectedProfile.description}</p>
            <p><strong>Preferences:</strong> {selectedProfile.preferences}</p>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedProfile(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AllProfilesPage;
