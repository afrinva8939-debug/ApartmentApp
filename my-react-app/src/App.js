// src/App.js (example)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResultsPage from './pages/ResultsPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
