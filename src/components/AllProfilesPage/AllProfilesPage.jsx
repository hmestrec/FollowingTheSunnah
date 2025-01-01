import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from '@aws-amplify/auth';
import awsExports from '../../aws-exports';
import styles from './AllProfilesPage.module.css';

const AllProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null); // For modal
  const navigate = useNavigate();

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

  const handleCreateProfileClick = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user) {
        navigate('/create-profile');
      }
    } catch (error) {
      toast.error('You must be logged in to create a profile.');
      navigate('/login'); // Redirect to login page if not authenticated
    }
  };

  const handleDeleteProfile = async (user_id, profile_id) => {
    const apiUrl = getApiUrl();
    if (!apiUrl || !isAdmin) {
      toast.error("Unauthorized action.");
      return;
    }
  
    try {
      // Get the current session and access token
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken(); // Fetch the ID token
  
      const response = await fetch(`${apiUrl}/profiles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add the Authorization header
        },
        body: JSON.stringify({ user_id, profile_id }),
      });
  
      if (response.ok) {
        toast.success("Profile deleted successfully.");
        fetchAllProfiles(); // Refresh profiles
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || "Failed to delete profile."}`);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Error deleting profile.");
    }
  };
  

  useEffect(() => {
    fetchUserDetails();
    fetchAllProfiles();
  }, []);

  return (
    <div className={styles.allProfilesContainer}>
      {/* Learn About Marriage Section */}
      <section className={styles.learnSection}>
        <h2>Learn About Marriage</h2>
        <p>
        Aisha reported: The Messenger of Allah, peace and blessings be upon him, said, “Marriage is part of my Sunnah. Whoever does not act upon my Sunnah is not part of me. Give each other in marriage, for I will boast of your great numbers before the nations. Whoever has the means, let him contract a marriage. Whoever does not have the means should fast, as fasting will restrain his impulses.”

Source: Sunan Ibn Mājah 1846

Grade: Sahih (authentic) according to Al-Albani
        </p>
        <button className={styles.createProfileButton} onClick={handleCreateProfileClick}>
          Create Your Profile
        </button>
      </section>

      {/* Profiles Section */}
      <h2 className={styles.title}>All Marriage Profiles</h2>
      <div className={styles.profilesGallery}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.profile_id} className={styles.profileCard}>
              <div className={styles.profileImage}>🌟</div>
              <div className={styles.profileDetails}>
                <h3 className={styles.profileName}>{profile.name}</h3>
                <p>
                  <strong>Age:</strong> {profile.age}
                </p>
                <p>
                  <strong>Gender:</strong> {profile.gender}
                </p>
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
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProfile.name}</h3>
            <p>
              <strong>Age:</strong> {selectedProfile.age}
            </p>
            <p>
              <strong>Gender:</strong> {selectedProfile.gender}
            </p>
            <p>
              <strong>Location:</strong> {selectedProfile.location}
            </p>
            <p>
              <strong>Description:</strong> {selectedProfile.description}
            </p>

            {/* Bio */}
            <div>
              <div className={styles.sectionHeading}>Bio</div>
              <ul>
                {Object.entries(selectedProfile.bio || {}).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong>
                    {String(value)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preferences */}
            <div>
              <div className={styles.sectionHeading}>Preferences</div>
              <ul>
                {Object.entries(selectedProfile.preferences || {}).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong>
                    {String(value)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Goals */}
            <div>
              <div className={styles.sectionHeading}>Goals</div>
              <ul>
                {Object.entries(selectedProfile.goals || {}).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong>
                    {String(value)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deen */}
            <div>
              <div className={styles.sectionHeading}>Deen</div>
              <ul>
                {Object.entries(selectedProfile.deen || {}).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1')}: </strong>
                    {String(value)}
                  </li>
                ))}
              </ul>
            </div>

            <button className={styles.closeButton} onClick={() => setSelectedProfile(null)}>
              &times;
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AllProfilesPage;
