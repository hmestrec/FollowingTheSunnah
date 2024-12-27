import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from '@aws-amplify/auth';
import awsExports from '../../aws-exports';
import { v4 as uuidv4 } from 'uuid';
import styles from './CreateProfile.module.css';

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
      const response = await fetch(`${apiUrl}/profiles/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
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
      } else {
        toast.info('No profile found.');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
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
            Country of Origin:
            <input
              type="text"
              className={styles.input}
              value={bio.from}
              onChange={(e) => setBio({ ...bio, from: e.target.value })}
              placeholder="e.g., Cuba, USA"
            />
          </label>
          <label className={styles.label}>
            Current City:
            <input
              type="text"
              className={styles.input}
              value={bio.currentCity}
              onChange={(e) => setBio({ ...bio, currentCity: e.target.value })}
              placeholder="e.g., Houston, TX"
            />
          </label>
          <label className={styles.label}>
            Revert:
            <input
              type="checkbox"
              checked={bio.revert}
              onChange={(e) => setBio({ ...bio, revert: e.target.checked })}
            />
          </label>
          <label className={styles.label}>
            Occupation:
            <input
              type="text"
              className={styles.input}
              value={bio.occupation}
              onChange={(e) => setBio({ ...bio, occupation: e.target.value })}
              placeholder="e.g., CNC Programmer/Web Developer"
            />
          </label>
          <label className={styles.label}>
            Hobbies:
            <input
              type="text"
              className={styles.input}
              value={bio.hobbies}
              onChange={(e) => setBio({ ...bio, hobbies: e.target.value })}
              placeholder="e.g., Running/Camping"
            />
          </label>
        </fieldset>

{/* Preferences Section */}
<fieldset className={styles.fieldset}>
  <legend className={styles.legend}>Preferences</legend>
  <label className={styles.label}>
    Hijab Preference:
    <select
      className={styles.select}
      value={preferences.hijab}
      onChange={(e) => setPreferences({ ...preferences, hijab: e.target.value })}
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="Open">Open</option>
    </select>
  </label>
  <label className={styles.label}>
    Makeup Preference:
    <select
      className={styles.select}
      value={preferences.makeup}
      onChange={(e) => setPreferences({ ...preferences, makeup: e.target.value })}
    >
      <option value="">Select</option>
      <option value="Minimal">Minimal</option>
      <option value="No Preference">No Preference</option>
      <option value="None">None</option>
    </select>
  </label>
  <label className={styles.label}>
    Ambition to Seek Knowledge:
    <input
      type="text"
      className={styles.input}
      value={preferences.ambitionToSeekKnowledge}
      onChange={(e) =>
        setPreferences({ ...preferences, ambitionToSeekKnowledge: e.target.value })
      }
      placeholder="Describe their ambition for knowledge"
    />
  </label>
  <label className={styles.label}>
    Personality Traits:
    <input
      type="text"
      className={styles.input}
      value={preferences.personalityTraits}
      onChange={(e) =>
        setPreferences({ ...preferences, personalityTraits: e.target.value })
      }
      placeholder="e.g., Kind, Supportive"
    />
  </label>
  <label className={styles.label}>
    Willing to Work:
    <select
      className={styles.select}
      value={preferences.willingToWork}
      onChange={(e) =>
        setPreferences({ ...preferences, willingToWork: e.target.value })
      }
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="Open to Discuss">Open to Discuss</option>
    </select>
  </label>
  <label className={styles.label}>
    Wants Kids:
    <select
      className={styles.select}
      value={preferences.wantsKids}
      onChange={(e) => setPreferences({ ...preferences, wantsKids: e.target.value })}
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="Maybe">Maybe</option>
    </select>
  </label>
  <label className={styles.label}>
    Cooks:
    <select
      className={styles.select}
      value={preferences.cooks}
      onChange={(e) => setPreferences({ ...preferences, cooks: e.target.value })}
    >
      <option value="">Select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="Learning">Learning</option>
    </select>
  </label>
  <label className={styles.label}>
    Cultural Background Preference:
    <input
      type="text"
      className={styles.input}
      value={preferences.culturalBackground}
      onChange={(e) =>
        setPreferences({ ...preferences, culturalBackground: e.target.value })
      }
      placeholder="e.g., Arab, Hispanic"
    />
  </label>
</fieldset>

{/* Goals Section */}
<fieldset className={styles.fieldset}>
  <legend className={styles.legend}>Goals</legend>
  <label className={styles.label}>
    Kids Preference:
    <select
      className={styles.select}
      value={goals.kidsPreference}
      onChange={(e) => setGoals({ ...goals, kidsPreference: e.target.value })}
    >
      <option value="">Select</option>
      <option value="None">None</option>
      <option value="Few">Few</option>
      <option value="Many">Many</option>
    </select>
  </label>
  <label className={styles.label}>
    Family Vision:
    <textarea
      className={styles.textarea}
      value={goals.familyVision}
      onChange={(e) => setGoals({ ...goals, familyVision: e.target.value })}
      placeholder="Describe your vision for a family"
    />
  </label>
  <label className={styles.label}>
    Career Goals:
    <input
      type="text"
      className={styles.input}
      value={goals.career}
      onChange={(e) => setGoals({ ...goals, career: e.target.value })}
      placeholder="e.g., Cybersecurity"
    />
  </label>
  <label className={styles.label}>
    Future Plans:
    <textarea
      className={styles.textarea}
      value={goals.futurePlans}
      onChange={(e) => setGoals({ ...goals, futurePlans: e.target.value })}
      placeholder="Describe your plans for the future"
    />
  </label>
</fieldset>

{/* Deen Section */}
<fieldset className={styles.fieldset}>
  <legend className={styles.legend}>Deen</legend>
  <label className={styles.label}>
    Knowledge Seeking:
    <textarea
      className={styles.textarea}
      value={deen.knowledgeSeeking}
      onChange={(e) => setDeen({ ...deen, knowledgeSeeking: e.target.value })}
      placeholder="Describe your approach to seeking knowledge"
    />
  </label>
  <label className={styles.label}>
    Relationship with Allah:
    <textarea
      className={styles.textarea}
      value={deen.relationshipWithAllah}
      onChange={(e) => setDeen({ ...deen, relationshipWithAllah: e.target.value })}
      placeholder="Describe your relationship with Allah"
    />
  </label>
  <label className={styles.label}>
    Prayer Habits:
    <textarea
      className={styles.textarea}
      value={deen.prayerHabits}
      onChange={(e) => setDeen({ ...deen, prayerHabits: e.target.value })}
      placeholder="Describe your prayer habits"
    />
  </label>
  <label className={styles.label}>
    Role as a Father:
    <textarea
      className={styles.textarea}
      value={deen.roleAsFather}
      onChange={(e) => setDeen({ ...deen, roleAsFather: e.target.value })}
      placeholder="Describe the type of father you want to be"
    />
  </label>
  <label className={styles.label}>
    Views on Islamic Education:
    <textarea
      className={styles.textarea}
      value={deen.viewsOnIslamicEducation}
      onChange={(e) => setDeen({ ...deen, viewsOnIslamicEducation: e.target.value })}
      placeholder="Describe your views on Islamic education"
    />
  </label>
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
