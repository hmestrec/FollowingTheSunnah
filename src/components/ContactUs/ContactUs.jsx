import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./ContactPage.module.css";
import awsExports from "../../aws-exports";

const ContactUs = () => {
  const [activeTab, setActiveTab] = useState("Bug Report");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const getApiUrl = () => {
    const api = awsExports.aws_cloud_logic_custom.find(
      (api) => api.name === "EmailServiceAPI"
    );
    return api ? api.endpoint : null;
  };

  useEffect(() => {
    const renderBadge = () => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute("6LfG3KcqAAAAANX9rVweQTkOEUkTYE44kf_7vRec", {
          action: "submit",
        });
      });
    };

    if (window.grecaptcha) {
      renderBadge();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?render=6LfG3KcqAAAAANX9rVweQTkOEUkTYE44kf_7vRec";
      script.async = true;
      script.defer = true;
      script.onload = renderBadge;
      document.body.appendChild(script);
    }

    // Hide badge using CSS
    const style = document.createElement("style");
    style.innerHTML = `
      .grecaptcha-badge {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const sendMail = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = getApiUrl();
    if (!apiUrl) {
      toast.error("API endpoint not found. Please check your AWS Amplify configuration.");
      setLoading(false);
      return;
    }

    try {
      const captchaToken = await window.grecaptcha.execute(
        "6LfG3KcqAAAAANX9rVweQTkOEUkTYE44kf_7vRec",
        { action: "submit" }
      );

      const response = await fetch(`${apiUrl}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: activeTab, captchaToken }),
      });

      if (response.ok) {
        toast.success("Your message was sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send the message: ${errorData.error || "Unknown error."}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Contact Us</h1>
      <p className={styles.description}>
        Use the tabs below to report a bug, request a feature, or send us a general message.
      </p>

      <div className={styles.tabs}>
        {["Bug Report", "Feature Request", "General Message"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={sendMail} className={styles.form}>
        <label htmlFor="name" className={styles.label}>
          Name:
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          required
          className={styles.input}
        />

        <label htmlFor="email" className={styles.label}>
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your email"
          required
          className={styles.input}
        />

        <label htmlFor="subject" className={styles.label}>
          Subject:
        </label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
          className={styles.input}
        />

        <label htmlFor="message" className={styles.label}>
          Message:
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={`Your ${activeTab.toLowerCase()} details here...`}
          required
          className={styles.textarea}
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${loading ? styles.disabledButton : ""}`}
        >
          {loading ? "Sending..." : "Submit"}
        </button>
      </form>

      <div className={styles.recaptchaFooter}>
        <p>
          Protected by reCAPTCHA.{" "}
          <a
            href="https://www.google.com/intl/en/policies/privacy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://www.google.com/intl/en/policies/terms/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
