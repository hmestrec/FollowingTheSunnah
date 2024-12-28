import React from 'react';
import styles from './LegalPages.module.css';

const TermsOfService = () => {
  return (
    <div className={styles.legalContainer}>
      <h1 className={styles.legalHeading}>Terms of Service</h1>
      <p className={styles.legalText}>
        Welcome to FollowingSunnah.net. By using our services, you agree to the
        following terms and conditions. Please read them carefully.
      </p>

      <h2 className={styles.legalSubheading}>Use of Service</h2>
      <p className={styles.legalText}>
        You agree to use our services only for lawful purposes and in accordance
        with these terms. Any misuse, such as unauthorized access, fraudulent
        activity, or spamming, is strictly prohibited.
      </p>

      <h2 className={styles.legalSubheading}>Account Responsibilities</h2>
      <p className={styles.legalText}>
        If you create an account on our website, you are responsible for
        maintaining the confidentiality of your login credentials and for all
        activities that occur under your account.
      </p>

      <h2 className={styles.legalSubheading}>Content Ownership</h2>
      <p className={styles.legalText}>
        Users retain ownership of any content they upload, including product
        listings, reviews, and profile information. However, by submitting
        content, you grant us a non-exclusive, royalty-free, worldwide license
        to use, display, and distribute your content for the operation of our
        services.
      </p>

      <h2 className={styles.legalSubheading}>Prohibited Activities</h2>
      <ul className={styles.legalList}>
        <li className={styles.legalListItem}>Posting unlawful, harmful, or discriminatory content</li>
        <li className={styles.legalListItem}>Infringing on the intellectual property of others</li>
        <li className={styles.legalListItem}>Engaging in fraud or misrepresentation</li>
      </ul>

      <h2 className={styles.legalSubheading}>Termination of Service</h2>
      <p className={styles.legalText}>
        We reserve the right to terminate or suspend your access to our
        services at any time for any reason, including violations of these terms.
      </p>

      <h2 className={styles.legalSubheading}>Liability Disclaimer</h2>
      <p className={styles.legalText}>
        Our services are provided "as is" and "as available." We disclaim all
        warranties, express or implied, and will not be held liable for any
        damages resulting from your use of our website.
      </p>

      <h2 className={styles.legalSubheading}>Governing Law</h2>
      <p className={styles.legalText}>
        These terms are governed by the laws of [Your Country/State]. Any legal
        disputes will be resolved in the courts of [Your Jurisdiction].
      </p>
    </div>
  );
};

export default TermsOfService;
