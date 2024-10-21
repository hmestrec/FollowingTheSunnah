import React from "react";
import { Link } from "react-router-dom";
import './Header.css'; // Ensure you have some basic styling


const Header = () => {
  return (
    <header id="header">
      <Link to="/" className="home-link">Following the Sunnah</Link>
      <div className="tab">
        <Link to="/podcast"><button className="tablinks">Podcast</button></Link>
        <Link to="/topics"><button className="tablinks">Topics</button></Link>
        <Link to="/form"><button className="tablinks">Contact Us</button></Link>
        <Link to="/login"><button className="tablinks">Login</button></Link>
      </div>
    </header>
  );
};

export default Header;
