import React from 'react';
import styles from './LegalPages.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.legalContainer}>
      <h1 className={styles.legalHeading}>Privacy Policy</h1>
      <p className={styles.legalText}>
        At FollowingSunnah.net, your privacy is important to us. This Privacy
        Policy explains how we collect, use, and safeguard your personal
        information.
      </p>

      <h2 className={styles.legalSubheading}>Information We Collect</h2>
      <p className={styles.legalText}>
        We may collect the following information from you:
      </p>
      <ul className={styles.legalList}>
        <li className={styles.legalListItem}>Personal identification information (e.g., name, email)</li>
        <li className={styles.legalListItem}>Profile details (e.g., bio, preferences)</li>
        <li className={styles.legalListItem}>Activity data (e.g., items added to cart, pages visited)</li>
        <li className={styles.legalListItem}>Device and browser information</li>
      </ul>

      <h2 className={styles.legalSubheading}>How We Use Your Information</h2>
      <p className={styles.legalText}>
        Your data is used for the following purposes:
      </p>
      <ul className={styles.legalList}>
        <li className={styles.legalListItem}>To provide and enhance our services</li>
        <li className={styles.legalListItem}>To send updates, newsletters, or notifications</li>
        <li className={styles.legalListItem}>To improve website functionality and user experience</li>
        <li className={styles.legalListItem}>To ensure security and detect potential fraud</li>
      </ul>

      <h2 className={styles.legalSubheading}>Data Sharing and Storage</h2>
      <p className={styles.legalText}>
        We do not sell your personal data to third parties. However, we may
        share data with trusted service providers for purposes like payment
        processing or analytics. Your data is securely stored and encrypted.
      </p>

      <h2 className={styles.legalSubheading}>Your Rights</h2>
      <p className={styles.legalText}>
        You have the right to:
      </p>
      <ul className={styles.legalList}>
        <li className={styles.legalListItem}>Access and review your data</li>
        <li className={styles.legalListItem}>Request corrections to your data</li>
        <li className={styles.legalListItem}>Request deletion of your data</li>
        <li className={styles.legalListItem}>Opt out of marketing communications</li>
      </ul>

      <h2 className={styles.legalSubheading}>Cookies and Tracking</h2>
      <p className={styles.legalText}>
        We use cookies to improve your browsing experience and analyze website
        traffic. You can manage cookie preferences in your browser settings.
      </p>

      <h2 className={styles.legalSubheading}>Changes to This Policy</h2>
      <p className={styles.legalText}>
        We may update this Privacy Policy periodically. Please check this page
        regularly to stay informed.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
