// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage' /* or your actual home page path */;
import ResultsPage from './pages/ResultsPage';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <h1>ApartmentApp</h1>
        <nav>
          <Link to="/">Home</Link> {' | '}
          <Link to="/results">Results</Link> {' | '}
          <Link to="/about">About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
