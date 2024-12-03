import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PodcastPage from './components/PodcastPage';
import Header from './components/Header';
import TopicsPage from './components/TopicsPage';
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import ContentPage from './components/ContentPage';
import Footer from './components/Footer';
import SunMoon from './components/SunMoon';
import EditingPage from './components/EditingPage';
import Comments from './components/Comments';
import MuslimBusinesses from './components/MuslimBusinesses'; // Import the new component
import BusinessManagement from './components/BusinessManagement'; // Import the management component
import './App.css'; // Ensure this path is correct

function App() {
  return (
    <Router>
      <div className="wrapper">
        {/* Sun and Moon background animation */}
        <SunMoon />

        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/podcast" element={<PodcastPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/content/:id" element={<ContentPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/editing" element={<EditingPage />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/muslim-businesses" element={<MuslimBusinesses />} />
            <Route path="/business-management" element={<BusinessManagement />} /> {/* New Management Route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
