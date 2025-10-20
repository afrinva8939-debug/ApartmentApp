// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome — Home</h1>
      <p>This is the Home page placeholder. Use navigation links:</p>
      <ul>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/results">Results</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </div>
  );
}
