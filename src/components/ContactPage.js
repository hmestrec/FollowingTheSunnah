import React, { useState } from "react";
import emailjs from "emailjs-com";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const sendMail = (e) => {
    e.preventDefault();
    emailjs.send("service_8okqasb", "template_wxu98pd", formData)
      .then(() => {
        alert("Your message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <form onSubmit={sendMail}>
      <h1>Contacting us</h1>
      <input type="text" id="name" value={formData.name} onChange={handleChange} placeholder="Enter name" />
      <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
      <input type="text" id="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" />
      <textarea id="message" value={formData.message} onChange={handleChange} placeholder="Your message"></textarea>
      <button type="submit">Submit</button>
    </form>
  );
};

export default ContactPage;
