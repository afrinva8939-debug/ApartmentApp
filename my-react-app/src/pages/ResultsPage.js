import React, { useEffect, useState } from 'react';
import { fetchResults } from '../api'; // named import

function ResultsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const filters = Object.fromEntries(qs.entries());
    fetchResults(filters)
      .then(data => setRows(data.rows || []))
      .catch(err => setError(err.message || 'Failed to fetch'));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Search Results</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <ul>
        {rows.map(r => (
          <li key={r.id || r.refid}>{r.apt_result_apartment_name} — {r.apt_result_bed} / {r.apt_result_bath}</li>
        ))}
      </ul>
    </div>
  );
}

export default ResultsPage;
