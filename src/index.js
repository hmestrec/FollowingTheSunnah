import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; 
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; 

// Import global CSS files
import './App.css';
import './components/contentpage.css';
import './components/LogIn.css';

// Configure Amplify
Amplify.configure(awsExports);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);