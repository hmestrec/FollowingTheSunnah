import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ThemeProvider from './components/ThemeContext'; // Correct default import
import Header from './components/Header';
import Footer from './components/Footer';
import PodcastPage from './components/PodcastPage';
import TopicsPage from './components/TopicsPage';
import JourneyPage from "./components/JourneyPage";
import FundamentalsPage from "./components/FundamentalsPage";
import PathwaysPage from "./components/PathwaysPage";
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import ContentPage from './components/ContentPage';
import HomePage from './components/HomePage';
import EditingPage from './components/EditingPage';
import Comments from './components/Comments';
import MuslimBusinesses from './components/MuslimBusinesses';
import BusinessManagement from './components/BusinessManagement';
import ChatBot from './components/chatbot';
import CreateProfile from './components/CreateProfile';
import AllProfilesPage from './components/AllProfilesPage';
import Settings from './components/Settings';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* Wrap the app with ThemeProvider */}
        <Router>
          <div className="wrapper">
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/comments" element={<Comments />} />
              </Routes>
            </main>
            <ChatBot />
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
