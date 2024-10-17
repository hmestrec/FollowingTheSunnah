// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import PodcastPage from './components/PodcastPage';
import TopicsPage from './components/TopicsPage';
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import AboutPage from './components/AboutPage';  // New About Page

function App() {
  return (
    <Router>
      <header id="header">
        <h1>Following the Sunnah</h1>
        <div className="tab">
          <Link to="/podcast"><button className="tablinks">Podcast</button></Link>
          <Link to="/topics"><button className="tablinks">Topics</button></Link>
          <Link to="/form"><button className="tablinks">Contact Us</button></Link>
          <Link to="/login"><button className="tablinks">Login</button></Link>
          <Link to="/about"><button className="tablinks">About Us</button></Link>  {/* New About Link */}
        </div>
      </header>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/podcast" component={PodcastPage} />
        <Route path="/topics" component={TopicsPage} />
        <Route path="/form" component={FormPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/about" component={AboutPage} />  {/* New About Route */}
      </Switch>
    </Router>
  );
}

export default App;
