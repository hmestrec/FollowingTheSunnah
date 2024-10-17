import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PodcastPage from './PodcastPage'; // Import your pages
import TopicsPage from './TopicsPage';
import FormPage from './FormPage';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import './App.css'; // Import your CSS

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
