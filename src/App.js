import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import './App.css';
import SunMoon from './components/SunMoon';
import Header from './components/Header';
import Footer from './components/Footer';
import PodcastPage from './components/PodcastPage';
import TopicsPage from './components/TopicsPage';
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import ContentPage from './components/ContentPage';
import HomePage from './components/HomePage';
import EditingPage from './components/EditingPage';
import Comments from './components/Comments';
import MuslimBusinesses from './components/MuslimBusinesses';
import BusinessManagement from './components/BusinessManagement';
import ChatBot from './components/chatbot'; // Corrected import statement

function App() {
  return (
    <Router>
      <div className="wrapper">
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
            <Route path="/business-management" element={<BusinessManagement />} />
          </Routes>
        </main>
        <ChatBot /> {/* Render ChatBot */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;