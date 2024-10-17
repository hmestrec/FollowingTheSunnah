import React from "react";
import { Link } from "react-router-dom";


const TopicsPage = () => {
  return (
    <main>
      <h1>Topics</h1>
      <Link to="/WhyBeard" className="button-link-topics">
        Why do Muslims keep the beard?
      </Link>
      <br />
      <Link to="/WakingUpEarly" className="button-link-topics">
        Waking up early
      </Link>
    </main>
  );
};

export default TopicsPage;
