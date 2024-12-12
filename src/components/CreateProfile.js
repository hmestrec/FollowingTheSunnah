import React, { useState } from 'react';
import awsExports from '../aws-exports'; // Adjust path based on your project structure

const CreateProfile = () => {
  const [formData, setFormData] = useState({
    profile_id: '',
    name: '',
    age: '',
    gender: '',
    location: '',
    description: '',
    preferences: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Extract API endpoint from awsExports
  const apiEndpoint = `${awsExports.aws_cloud_logic_custom.find(
    (api) => api.name === 'MarriageProfilesAPI' // Adjust API name if needed
  )?.endpoint}/profiles`;

  if (!apiEndpoint) {
    console.error('API endpoint not found in aws-exports.js');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage('Profile created successfully!');
        setFormData({
          profile_id: '',
          name: '',
          age: '',
          gender: '',
          location: '',
          description: '',
          preferences: '',
        });
      } else {
        setResponseMessage(`Error: ${data.error || 'Failed to create profile'}`);
      }
    } catch (error) {
      setResponseMessage('An error occurred while creating the profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Create a Marriage Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Profile ID:
          <input
            type="text"
            name="profile_id"
            value={formData.profile_id}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Gender:
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <label>
          Preferences:
          <textarea
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Create Profile'}
        </button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};

export default CreateProfile;
