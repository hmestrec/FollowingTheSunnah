import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from '@aws-amplify/auth';
import awsExports from '../aws-exports';
import './AllProfilesPage.css';

const AllProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

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
    <div className="all-profiles-container">
      <h2>All Marriage Profiles</h2>
      <div className="profiles-gallery">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.profile_id} className="profile-card">
              <div className="profile-image">🌟</div>
              <div className="profile-details">
                <h3 className="profile-name">{profile.name}</h3>
                <p><strong>Age:</strong> {profile.age}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <p><strong>Location:</strong> {profile.location}</p>
                <p><strong>Description:</strong> {profile.description}</p>
                <p><strong>Preferences:</strong> {profile.preferences}</p>
              </div>
              {isAdmin && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteProfile(profile.user_id, profile.profile_id)}
                >
                  Delete Profile
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No profiles found.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AllProfilesPage;
