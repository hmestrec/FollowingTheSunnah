import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from '@aws-amplify/auth';
import awsExports from '../../aws-exports';
import { v4 as uuidv4 } from 'uuid';
import styles from './CreateProfile.module.css';

// Utility function to include JWT token in API requests
const fetchWithAuth = async (url, options = {}) => {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();

    if (!token) throw new Error('JWT Token is missing');

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Response Error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchWithAuth:', error.message || error);
    throw error;
  }
};

const MarriageProfiles = () => {
  const [userId, setUserId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bio, setBio] = useState({
    from: '',
    currentCity: '',
    revert: false,
    occupation: '',
    culturalBackground: '',
    hobbies: '',
  });
  const [preferences, setPreferences] = useState({
    hijab: '',
    makeup: '',
    ambitionToSeekKnowledge: '',
    personalityTraits: '',
    willingToWork: '',
    wantsKids: '',
    cooks: '',
    culturalBackground: '',
  });
  const [goals, setGoals] = useState({
    kidsPreference: '',
    familyVision: '',
    career: '',
    futurePlans: '',
  });
  const [deen, setDeen] = useState({
    knowledgeSeeking: '',
    relationshipWithAllah: '',
    prayerHabits: '',
    roleAsFather: '',
    viewsOnIslamicEducation: '',
  });
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
      const data = await fetchWithAuth(`${apiUrl}/profiles/${userId}`);
      setProfileId(data.profile_id);
      setName(data.name);
      setAge(data.age);
      setGender(data.gender);
      setLocation(data.location);
      setDescription(data.description);
      setBio(data.bio || {});
      setPreferences(data.preferences || {});
      setGoals(data.goals || {});
      setDeen(data.deen || {});
      setIsEditing(true);
    } catch (error) {
      toast.info('No profile found or failed to fetch data.');
    }
  };

  const fetchUserId = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      setUserId(userId);
      setProfileId(uuidv4());
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
      bio,
      preferences,
      goals,
      deen,
    };

    try {
      const data = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(body),
      });
      toast.success(isEditing ? 'Profile updated successfully' : 'Profile created successfully');
      fetchProfiles();
    } catch (error) {
      toast.error('An error occurred while saving the profile.');
    }
  };

  return (
    <div className={styles.marriageProfilesContainer}>
      <form onSubmit={handleSaveProfile} className={styles.profileForm}>
        <h2 className={styles.heading}>
          {isEditing ? 'Edit Your Marriage Profile' : 'Create Your Marriage Profile'}
        </h2>

        {/* Basic Information */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Basic Information</legend>
          <label className={styles.label}>
            Name:
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </label>
          <label className={styles.label}>
            Age:
            <input
              type="number"
              className={styles.input}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              required
            />
          </label>
          <label className={styles.label}>
            Gender:
            <select
              className={styles.select}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label className={styles.label}>
            Location:
            <input
              type="text"
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City and State"
              required
            />
          </label>
          <label className={styles.label}>
            Description:
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe yourself"
              required
            />
          </label>
        </fieldset>

        {/* Bio */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Bio</legend>
          <label className={styles.label}>
            From:
            <input
              type="text"
              className={styles.input}
              value={bio.from}
              onChange={(e) => setBio({ ...bio, from: e.target.value })}
              placeholder="Where are you from?"
            />
          </label>

        </fieldset>

        {/* Preferences */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Preferences</legend>
          {/* Add fields for Preferences */}
        </fieldset>

        {/* Goals */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Goals</legend>
          {/* Add fields for Goals */}
        </fieldset>

        {/* Deen */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Deen</legend>
          {/* Add fields for Deen */}
        </fieldset>

        <button type="submit" className={styles.saveButton}>
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default MarriageProfiles;
