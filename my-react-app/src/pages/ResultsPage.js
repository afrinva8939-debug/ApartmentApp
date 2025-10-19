// src/pages/ResultsPage.js
import React, { useEffect, useState } from 'react';

export default function ResultsPage({ initialFilters }) {
  // initialFilters can come from URL or parent
  const [filters, setFilters] = useState({ bath: 1, beds: 2, ...initialFilters });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.bath !== undefined) params.set('bath', filters.bath);
        if (filters.beds !== undefined) params.set('beds', filters.beds);

        const url = `/api/results?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${txt}`);
        }
        const data = await resp.json();
        if (!data.ok) {
          setError(data.error || 'Unknown API error');
          setRows([]);
        } else {
          setRows(data.rows || []);
        }
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [filters]);

  return (
    <div>
      <h1>Search Results</h1>
      <p>Filters: {JSON.stringify(filters)}</p>
      {loading && <p>Loading…</p>}
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      {!loading && !error && rows.length === 0 && <p>No results</p>}
      <ul>
        {rows.map(r => (
          <li key={r.id || r.refid}>
            <strong>{r.apt_result_apartment_name || r.refid}</strong>
            <div>{r.apt_result_address}</div>
            <div>Beds: {r.beds}, Baths: {r.bath}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
