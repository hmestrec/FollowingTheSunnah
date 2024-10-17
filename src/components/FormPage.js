import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const FormPage = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Handler for form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to send the email
  const sendMail = (e) => {
    e.preventDefault();

    const { name, email, subject, message } = formState;

    // Parameters for emailjs
    const params = {
      name,
      email,
      subject,
      message,
    };

    // Replace these with your actual EmailJS service and template IDs
    const serviceID = 'service_8okqasb';
    const templateID = 'template_wxu98pd';

    emailjs.send(serviceID, templateID, params, 'fkSqrZuRax9W_a--f')
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        alert('Your message has been sent successfully!');
        setFormState({ name: '', email: '', subject: '', message: '' }); // Clear the form
      })
      .catch((err) => {
        console.error('Failed to send the message', err);
        alert('Failed to send the message. Please try again.');
      });
  };

  return (
    <div>
      <h1>Contact Us</h1>
      <form onSubmit={sendMail}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formState.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formState.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormPage;
