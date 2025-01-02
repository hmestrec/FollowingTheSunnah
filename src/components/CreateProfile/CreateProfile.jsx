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
  
        {/* Who I Am Section */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Who I Am</legend>
  
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
            Location (City and State):
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
            Where are you from originally?
            <input
              type="text"
              className={styles.input}
              value={bio.from}
              onChange={(e) => setBio({ ...bio, from: e.target.value })}
              placeholder="Country of origin"
              required
            />
          </label>
  
          <label className={styles.label}>
            Are you a revert?
            <select
              className={styles.select}
              value={bio.revert ? "Yes" : "No"}
              onChange={(e) =>
                setBio({ ...bio, revert: e.target.value === "Yes" })
              }
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Occupation:
            <input
              type="text"
              className={styles.input}
              value={bio.occupation}
              onChange={(e) => setBio({ ...bio, occupation: e.target.value })}
              placeholder="Your job or field of work"
              required
            />
          </label>
  
          <label className={styles.label}>
            Education Level:
            <select
              className={styles.select}
              value={bio.education}
              onChange={(e) => setBio({ ...bio, education: e.target.value })}
              required
            >
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Cultural Background:
            <input
              type="text"
              className={styles.input}
              value={bio.culturalBackground}
              onChange={(e) => setBio({ ...bio, culturalBackground: e.target.value })}
              placeholder="Your cultural or ethnic background"
            />
          </label>
  
          <label className={styles.label}>
            Hobbies and Interests:
            <textarea
              className={styles.textarea}
              value={bio.hobbies}
              onChange={(e) => setBio({ ...bio, hobbies: e.target.value })}
              placeholder="Your hobbies and interests"
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
  
        {/* Who I Want Section */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Who I Want</legend>
  
          <label className={styles.label}>
            Age Range:
            <select
              className={styles.select}
              value={preferences.ageRange}
              onChange={(e) => setPreferences({ ...preferences, ageRange: e.target.value })}
            >
              <option value="">Select Age Range</option>
              <option value="18-25">18-25</option>
              <option value="26-30">26-30</option>
              <option value="31-35">31-35</option>
              <option value="36-40">36-40</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Location Preference:
            <select
              className={styles.select}
              value={preferences.locationPreference}
              onChange={(e) => setPreferences({ ...preferences, locationPreference: e.target.value })}
            >
              <option value="">Select Location</option>
              <option value="Same City">Same City</option>
              <option value="Nearby State">Nearby State</option>
              <option value="Willing to Relocate">Willing to Relocate</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Education Level:
            <select
              className={styles.select}
              value={preferences.educationOrWork}
              onChange={(e) => setPreferences({ ...preferences, educationOrWork: e.target.value })}
            >
              <option value="">Select Education Level</option>
              <option value="Don't Care">Don't Care</option>
              <option value="High School">High School</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Religious Practice:
            <select
              className={styles.select}
              value={preferences.religiousPractice}
              onChange={(e) => setPreferences({ ...preferences, religiousPractice: e.target.value })}
            >
              <option value="">Select Religious Practice</option>
              <option value="Prays 5 Times">Prays 5 Times</option>
              <option value="Prays Occasionally">Prays Occasionally</option>
              <option value="Still Learning">Still Learning</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Modesty (Hijab):
            <select
              className={styles.select}
              value={preferences.hijabPreference}
              onChange={(e) => setPreferences({ ...preferences, hijabPreference: e.target.value })}
            >
              <option value="">Select Preference</option>
              <option value="Wears Hijab">Wears Hijab</option>
              <option value="Doesn't Wear Hijab">Doesn't Wear Hijab</option>
              <option value="Not Important">Not Important</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Family-Oriented:
            <select
              className={styles.select}
              value={preferences.familyOriented}
              onChange={(e) => setPreferences({ ...preferences, familyOriented: e.target.value })}
            >
              <option value="">Select Preference</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Not Sure">Not Sure</option>
            </select>
          </label>
  
          <label className={styles.label}>
            Personality Traits:
            <select
              className={styles.select}
              value={preferences.personalityTraits}
              onChange={(e) => setPreferences({ ...preferences, personalityTraits: e.target.value })}
            >
              <option value="">Select Personality Traits</option>
              <option value="Calm">Calm</option>
              <option value="Outgoing">Outgoing</option>
              <option value="Patient">Patient</option>
              <option value="Funny">Funny</option>
              <option value="Reserved">Reserved</option>
            </select>
          </label>
        </fieldset>
  
        <button type="submit" className={styles.saveButton}>
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
  

export default MarriageProfiles;
