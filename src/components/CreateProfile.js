import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from '@aws-amplify/auth';
import awsExports from '../aws-exports';
import { v4 as uuidv4 } from 'uuid';
import './CreateProfile.css';

const MarriageProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [userId, setUserId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [preferences, setPreferences] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const getApiUrl = () => {
    const apiUrl = awsExports.aws_cloud_logic_custom.find(
      (api) => api.name === 'MarriageProfilesAPI'
    )?.endpoint;

    if (!apiUrl) {
      console.error('MarriageProfilesAPI endpoint not found in aws-exports.js');
    }
    return apiUrl;
  };

  const fetchProfiles = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl || !userId) return;

    try {
      const response = await fetch(`${apiUrl}/profiles/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles([data]);
        setProfileId(data.profile_id);
        setName(data.name);
        setAge(data.age);
        setGender(data.gender);
        setLocation(data.location);
        setDescription(data.description);
        setPreferences(data.preferences);
        setIsEditing(true);
      } else {
        setProfiles([]);
        setIsEditing(false);
        toast.info('No profile found.');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchUserId = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub; // Cognito user ID
      console.log('Fetched user_id:', userId);
      setUserId(userId);
      setProfileId(uuidv4()); // Auto-generate profile_id
    } catch (error) {
      console.error('Error fetching user ID:', error);
      toast.error('Error: User not authenticated.');
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfiles();
    }
  }, [userId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiUrl}/profiles/${userId}` : `${apiUrl}/profiles`;

    const body = {
      user_id: userId,
      profile_id: profileId || uuidv4(),
      name,
      age,
      gender,
      location,
      description,
      preferences,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(isEditing ? 'Profile updated successfully' : 'Profile created successfully');
        fetchProfiles();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to save profile'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('An error occurred while saving the profile.');
    }
  };

  const handleDeleteProfile = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl || !userId || !profileId) {
      toast.error('Missing user_id or profile_id');
      return;
    }
  
    console.log('Deleting profile with:', { user_id: userId, profile_id: profileId });
  
    try {
      const response = await fetch(`${apiUrl}/profiles`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          profile_id: profileId,
        }),
      });
  
      if (response.ok) {
        toast.success('Profile deleted successfully');
        clearForm();
        setProfiles([]);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to delete profile'}`);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('An error occurred while deleting the profile.');
    }
  };  

  const clearForm = () => {
    setProfileId('');
    setName('');
    setAge('');
    setGender('');
    setLocation('');
    setDescription('');
    setPreferences('');
  };

  return (
    <div className="marriage-profiles-container">
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>{isEditing ? 'Edit Your Marriage Profile' : 'Create Your Marriage Profile'}</h2>
      <form onSubmit={handleSaveProfile}>
        <label>
          User ID:
          <input type="text" value={userId} disabled />
        </label>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Age:
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
        </label>
        <label>
          Gender:
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <label>
          Location:
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>
        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        </label>
        <label>
          Preferences:
          <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} required></textarea>
        </label>
        <button type="submit">{isEditing ? 'Update Profile' : 'Create Profile'}</button>
        {isEditing && (
          <button type="button" onClick={handleDeleteProfile} style={{ backgroundColor: 'red', color: 'white' }}>
            Delete Profile
          </button>
        )}
      </form>
    </div>
    </div>
  );
};

export default MarriageProfiles;
