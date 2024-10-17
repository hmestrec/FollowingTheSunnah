import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import App from './App';
import { Amplify } from 'aws-amplify'; // Correct import for Amplify
import awsExports from './aws-exports';

// Configure Amplify
Amplify.configure(awsExports);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
