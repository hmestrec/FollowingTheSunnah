import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import PodcastPage from './components/PodcastPage';
import TopicsPage from './components/TopicsPage';
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import WhyBeard from './components/WhyBeard'; // Import the WhyBeard component
import WakingUpEarly from './components/WakingUpEarly'; // Import the WakingUpEarly component

function App() {
  return (
    <Router>
      <div>
        <Header /> {/* Make sure the header is rendered */}
        <Routes>
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/whybeard" element={<WhyBeard />} /> {/* Add the WhyBeard route */}
          <Route path="WakingUpEarly" element={<WakingUpEarly />} /> 
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
