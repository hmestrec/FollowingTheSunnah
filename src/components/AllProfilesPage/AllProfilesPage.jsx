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
      <section className={styles.introSection}>
        <h2>Welcome to the Halal Marriage Platform</h2>
        <p>
          This platform is designed exclusively for brothers seeking a halal means to connect 
          with potential partners in a way that strictly adheres to Islamic principles. 
          There will be no pictures, no chatting, and no direct interactions. 
          This is not a platform to "get to know" someone but to provide an introduction 
          that aligns with the Sunnah.
        </p>
      </section>

      <section className={styles.howToUseSection}>
        <h2>How This Platform Works</h2>
        <p>
          Follow these guidelines to use the platform in a manner consistent with Islamic values:
        </p>
        <ol>
          <li>
            <strong>Create Your Profile:</strong> Share your basic details and preferences 
            to introduce yourself.
          </li>
          <li>
            <strong>View Profiles:</strong> Browse through other profiles to find someone 
            who aligns with your values.
          </li>
          <li>
            <strong>Contact Through Wali:</strong> If a Wali (guardian) is interested in a brother 
            for their female relative, they can contact the Admin brother to arrange a meeting.
          </li>
          <li>
            <strong>Meet at a Masjid:</strong> All meetings must take place in a Masjid, with proper 
            Islamic etiquette observed. 
          </li>
          <li>
            <strong>Continue Halal:</strong> After the initial meeting, families can decide 
            how to proceed in a halal manner.
          </li>
        </ol>
      </section>


      {/* Learn About Marriage Section */}
      <section className={styles.learnSection}>
        <h2>Learn About Marriage</h2>
        <p>
        Aisha reported: The Messenger of Allah, peace and blessings be upon him, said, “Marriage is part of my Sunnah. Whoever does not act upon my Sunnah is not part of me. Give each other in marriage, for I will boast of your great numbers before the nations. Whoever has the means, let him contract a marriage. Whoever does not have the means should fast, as fasting will restrain his impulses.”

Source: Sunan Ibn Mājah 1846

Grade: Sahih (authentic) according to Al-Albani
        </p>
      </section>

      <div className={styles.goalSection}>
      <h2>Mission</h2>
      <p>
        In a society where casual dating has become the norm, it is vital to uphold
        the principles of Islam by providing halal alternatives for seeking a life
        partner. This page aims to facilitate marriage in a way that aligns with the
        Quran and Sunnah, safeguarding individuals from the harmful consequences of
        zina.
      </p>
      <blockquote>
        <p>
          <strong>Allah says:</strong> "And do not approach unlawful sexual
          intercourse. Indeed, it is an abomination and an evil way."
        </p>
        <cite>— Surah Al-Isra (17:32)</cite>
      </blockquote>
      <p>
        The Prophet Muhammad (peace and blessings be upon him) emphasized the
        importance of marriage, saying:
      </p>
      <blockquote>
        <p>
          "When a man marries, he has fulfilled half of his religion, so let him fear
          Allah regarding the remaining half."
        </p>
        <cite>— Jami` at-Tirmidhi 3096</cite>
      </blockquote>
      <p>
        Zina not only harms the soul but also disrupts the social fabric, leading to
        numerous emotional and societal problems. By promoting halal connections, we
        strive to protect our communities and help Muslims fulfill their deen in the
        most beautiful way.
      </p>

              <button className={styles.createProfileButton} onClick={handleCreateProfileClick}>
          Create Your Profile
        </button>
    </div>


    <div className={styles.profilesGallery}>
  {profiles.length > 0 ? (
    profiles.map((profile) => (
      <div key={profile.profile_id} className={styles.profileCard}>
        <div className={styles.profileDetails}>
          <h3 className={styles.profileName}>{profile.name}</h3>
          <p>
            <strong>Age:</strong> {profile.age}
          </p>
          <p>
            <strong>Location:</strong> {profile.location}
          </p>
          <button
            className={styles.moreDetailsButton}
            onClick={() => setSelectedProfile(profile)}
          >
            More Details
          </button>
          <button
            className={styles.setUpMeetingButton}
            onClick={() => navigate("/contact")}
          >
            Set Up Meeting
          </button>
          {isAdmin && ( // Check if the user is an admin
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
      <button className={styles.closeButton} onClick={() => setSelectedProfile(null)}>
        &times;
      </button>

      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>{selectedProfile.name}</h3>
        <p className={styles.modalSubtitle}>
          <strong>Age:</strong> {selectedProfile.age}
        </p>
        <p className={styles.modalSubtitle}>
          <strong>Location:</strong> {selectedProfile.location}
        </p>
      </div>

      <div className={styles.modalBody}>
        {/* Who I Am Section */}
        <div className={styles.modalSection}>
          <h4 className={styles.sectionHeading}>Who I Am</h4>
          <ul className={styles.detailsList}>
            <li>
              <strong>Where From:</strong> {selectedProfile.bio?.from || "Not Specified"}
            </li>
            <li>
              <strong>Revert:</strong> {selectedProfile.bio?.revert ? "Yes" : "No"}
            </li>
            <li>
              <strong>Occupation:</strong> {selectedProfile.bio?.occupation || "Not Specified"}
            </li>
            <li>
              <strong>Education:</strong> {selectedProfile.bio?.education || "Not Specified"}
            </li>
            <li>
              <strong>Cultural Background:</strong> {selectedProfile.bio?.culturalBackground || "Not Specified"}
            </li>
            <li>
              <strong>Hobbies and Interests:</strong> {selectedProfile.bio?.hobbies || "Not Specified"}
            </li>
            <li>
              <strong>Description:</strong> {selectedProfile.description || "Not Specified"}
            </li>
          </ul>
        </div>

        {/* Who I Want Section */}
        <div className={styles.modalSection}>
          <h4 className={styles.sectionHeading}>Who I Want</h4>
          <ul className={styles.detailsList}>
            {selectedProfile.preferences?.ageRange && (
              <li>
                <strong>Age Range:</strong> {selectedProfile.preferences.ageRange}
              </li>
            )}
            {selectedProfile.preferences?.locationPreference && (
              <li>
                <strong>Location Preference:</strong> {selectedProfile.preferences.locationPreference}
              </li>
            )}
            {selectedProfile.preferences?.educationOrWork && (
              <li>
                <strong>Education Level:</strong> {selectedProfile.preferences.educationOrWork}
              </li>
            )}
            {selectedProfile.preferences?.religiousPractice && (
              <li>
                <strong>Religious Practice:</strong> {selectedProfile.preferences.religiousPractice}
              </li>
            )}
            {selectedProfile.preferences?.hijabPreference && (
              <li>
                <strong>Modesty (Hijab):</strong> {selectedProfile.preferences.hijabPreference}
              </li>
            )}
            {selectedProfile.preferences?.familyOriented && (
              <li>
                <strong>Family-Oriented:</strong> {selectedProfile.preferences.familyOriented}
              </li>
            )}
            {selectedProfile.preferences?.personalityTraits && (
              <li>
                <strong>Personality Traits:</strong> {selectedProfile.preferences.personalityTraits}
              </li>
            )}
              <button className={styles.closeButton} onClick={() => setSelectedProfile(null)}>
                &times;
              </button>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}


export default AllProfilesPage;
