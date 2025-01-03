import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ThemeProvider from './components/ThemeContext'; // Correct default import
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PodcastPage from './components/PodcastPage/PodcastPage';
import TopicsPage from './components/TopicsPage/TopicsPage';
import JourneyPage from "./components/TopicsPage/JourneyPage";
import FundamentalsPage from "./components/TopicsPage/FundamentalsPage";
import PathwaysPage from "./components/TopicsPage/PathwaysPage";
import FormPage from './components/FormPage';
import LandingPage from './components/LandingPage/LandingPage';
import ContentPage from './components/TopicsPage/ContentPage';
import HomePage from './components/HomePage/HomePage';
import EditingPage from './components/EditingPage/EditingPage';
import Comments from './components/Comments/Comments';
import MuslimBusinesses from './components/MuslimBusinesses/MuslimBusinesses';
import BusinessManagement from './components/BusinessManagement/BusinessManagement';
import ChatBot from './components/ChatBot/ChatBot';
import CreateProfile from './components/CreateProfile/CreateProfile';
import AllProfilesPage from './components/AllProfilesPage/AllProfilesPage';
import Settings from './components/Settings/Settings';
import PrivacyPolicy from './components/LegalPages/PrivacyPolicy';
import TermsOfService from './components/LegalPages/TermsOfService';
import ContactUs from './components/ContactUs/ContactUs';
import ReCAPTCHA from "react-google-recaptcha";
import './App.css';
import { ToastContainer } from 'react-toastify';
import SessionManager from './components/SessionManager/SessionManager'; // Ensure this path is correct


function App() {
  const [user, setUser] = useState(null); // Global user state

  
  return (
    <AuthProvider>
      <ThemeProvider> {/* Wrap the app with ThemeProvider */}
      <SessionManager user={user} setUser={setUser}>
      <Router>
          <div id="root">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/podcast" element={<PodcastPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/journey" element={<JourneyPage />} />
                <Route path="/fundamentals" element={<FundamentalsPage />} />
                <Route path="/pathways" element={<PathwaysPage />} />
                <Route path="/form" element={<FormPage />} />
                <Route path="/content/:id" element={<ContentPage />} />
                <Route path="/muslim-businesses" element={<MuslimBusinesses />} />
                <Route path="/business-management" element={<BusinessManagement />} />
                <Route path="/editing" element={<EditingPage />} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="/all-profiles" element={<AllProfilesPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<LandingPage setUser={setUser} />} />
                <Route path="/comments" element={<Comments />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/contact" element={<ContactUs />} />
              </Routes>
            </main>
            <ChatBot />
            <Footer />
          </div>
          {<ToastContainer />}
          </Router>
        </SessionManager>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
