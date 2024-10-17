import React from 'react';
import ReactDOM from 'react-dom'; // For React 17
import './App.css'; // Ensure you have this file and the path is correct
import App from './App'; // Ensure this is the correct path

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // This should match the `id` in your index.html file
);
