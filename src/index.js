// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';  // Make sure this path is correct
import App from './App';  // Make sure this path is correct

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
