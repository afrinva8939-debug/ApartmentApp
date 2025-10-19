// src/pages/ResultsPage.js
import React, { useEffect, useState } from 'react';

/**
 * ResultsPage
 * - Fetches /api/results with optional query params from the page URL
 * - Renders loading, error, empty, and list states
 *
 * Usage:
 *  - Add a route to this component (e.g. /results?bath=1&beds=2)
 *  - Or use <ResultsPage bath={1} beds={2} />
 */
export default function ResultsPage({ bath: propBath, beds: propBeds }) {
  const [results, setResults] = useState(null); // null => loading, [] => no items
  const [error, setError] = useState(null);

  // If you want query parameters from the URL, use this helper:
  const getQueryParams = () => {
    try {
      const search = window.location.search || '';
      const params = new URLSearchParams(search);
      const q = {};
      if (params.has('bath')) q.bath = params.get('bath');
      if (params.has('beds')) q.beds = params.get('beds');
      if (params.has('limit')) q.limit = params.get('limit');
      return q;
    } catch (err) {
      return {};
    }
  };

  useEffect(() => {
    async function load() {
      setError(null);
      setResults(null); // show loading

      // prefer props if passed; otherwise fall back to URL query params
      const urlParams = getQueryParams();
      const bath = propBath ?? urlParams.bath;
      const beds = propBeds ?? urlParams.beds;
      const limit = urlParams.limit ?? 50;

      const query = new URLSearchParams();
      if (bath !== undefined) query.append('bath', bath);
      if (beds !== undefined) query.append('beds', beds);
      if (limit !== undefined) query.append('limit', limit);

      const url = `/api/results?${query.toString()}`;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(`Server returned ${res.status}: ${text || res.statusText}`);
        }

        const data = await res.json();
        // ensure it's an array
        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format from server');
        }

        setResults(data);
      } catch (err) {
        console.error('Fetch error', err);
        setError(err.message || 'Unknown error');
        setResults([]); // stop loading
      }
    }

    load();
    // Re-run when props change
  }, [propBath, propBeds]);

  // Render helpers
  if (results === null && error === null) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Search Results</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Search Results</h1>
        <p style={{ color: 'crimson' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (Array.isArray(results) && results.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Search Results</h1>
        <p>No apartments found.</p>
        <small>Try removing filters or check your database.</small>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Search Results</h1>
      <p>Found {results.length} result{results.length > 1 ? 's' : ''}</p>

      <div style={{ display: 'grid', gap: 12 }}>
        {results.map((r) => (
          <article key={r.id} style={{
            border: '1px solid #ddd',
            padding: 12,
            borderRadius: 8,
            maxWidth: 800
          }}>
            <h2 style={{ margin: '0 0 6px' }}>{r.title ?? `Apartment #${r.id}`}</h2>
            <div style={{ color: '#555', fontSize: 14 }}>
              <div><strong>Beds:</strong> {r.beds ?? 'N/A'}</div>
              <div><strong>Baths:</strong> {r.baths ?? 'N/A'}</div>
              <div><strong>Price:</strong> {r.price != null ? `$${r.price}` : 'N/A'}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
