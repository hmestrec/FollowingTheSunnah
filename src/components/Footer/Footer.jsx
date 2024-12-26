import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.copyright}>
          © Following The Sunnah, {new Date().getFullYear()}
        </p>
        <nav className={styles.footerNav}>
          <a href="#privacy" className={styles.footerLink}>
            Privacy Policy
          </a>
          <a href="#terms" className={styles.footerLink}>
            Terms of Service
          </a>
          <a href="#contact" className={styles.footerLink}>
            Contact Us
          </a>
        </nav>
      </div>
      <div className={styles.socialIcons}>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
        >
          <i className="fab fa-twitter"></i>
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
        >
          <i className="fab fa-facebook-f"></i>
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
        >
          <i className="fab fa-instagram"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
