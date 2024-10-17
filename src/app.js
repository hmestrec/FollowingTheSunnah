
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Import the components for each page
import PodcastPage from './components/PodcastPage';
import TopicsPage from './components/TopicsPage';
import FormPage from './components/FormPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/podcast" component={PodcastPage} />
        <Route path="/topics" component={TopicsPage} />
        <Route path="/form" component={FormPage} />
        <Route path="/login" component={LoginPage} />
        <Route exact path="/" component={HomePage} />
      </Switch>
    </Router>
  );
}

export default App;
