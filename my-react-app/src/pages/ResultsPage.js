// my-react-app/src/pages/ResultsPage.js
import React, { useEffect, useState } from 'react';

export default function ResultsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Example: read query string from browser (e.g. ?bath=1&beds=2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bath = params.get('bath');
    const beds = params.get('beds');

    // Call API
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build search params server-side expect e.g. /api/results?bath=1&beds=2
        const q = new URLSearchParams();
        if (bath) q.set('bath', bath);
        if (beds) q.set('beds', beds);
        q.set('limit', '100');

        const res = await fetch(`/api/results?${q.toString()}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`API error ${res.status}: ${txt}`);
        }
        const data = await res.json();
        if (!data.ok) {
          throw new Error(data.error || 'Unknown API error');
        }
        setResults(data.results || []);
      } catch (err) {
        setError(err.message || String(err));
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Search Results</h1>
      {loading && <p>Loading results…</p>}
      {error && (
        <div style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {!loading && results.length === 0 && <p>No apartments found.</p>}
      <ul>
        {results.map((r) => (
          <li key={r.id}>
            <strong>{r.apt_result_apartment_name || r.refid || r.id}</strong>
            <div>{r.apt_result_address}</div>
            <div>
              beds: {r.beds ?? '-'} • bath: {r.bath ?? '-'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
