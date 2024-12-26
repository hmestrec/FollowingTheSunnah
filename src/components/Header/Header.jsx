import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.homeButton}>
        Following the Sunnah
      </Link>
      <nav className={styles.nav}>
        <Link to="/podcast" className={styles.navLink}>Podcast</Link>
        <Link to="/topics" className={styles.navLink}>Topics</Link>
        <Link to="/form" className={styles.navLink}>Contact Us</Link>
        <Link to="/login" className={styles.navLink}>Login</Link>
        <Link to="/settings" className={styles.navLink}>Settings</Link>
      </nav>
    </header>
  );
};

export default Header;
