import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import PodcastPage from './components/PodcastPage';
import TopicsPage from './components/TopicsPage';
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import EditingPage from './components/EditingPage';
import ContentPage from './components/ContentPage'; // Import your new ContentPage
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/edit" element={<ProtectedRoute element={EditingPage} />} />
          <Route path="/content/:id" element={<ContentPage />} /> {/* Dynamic route for content */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
