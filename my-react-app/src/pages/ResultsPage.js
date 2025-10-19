import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ApartmentList from '../components/ApartmentList';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const url = `/api/apartments?${searchParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setApartments(data && data.success ? data.data : []);
    } catch (err) {
      console.error(err);
      setApartments([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handleBack() {
    navigate('/');
  }

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div className="results-header">
        <div>
          <h1 style={{ margin: 0 }}>Search Results</h1>
          <div style={{ color: 'var(--muted)', marginTop: 6 }}>
            {searchParams.toString() ? `Filters: ${searchParams.toString()}` : 'All apartments'}
          </div>
        </div>

        <div className="controls">
          <button className="btn secondary" onClick={handleBack}>Edit Search</button>
          <button className="btn" onClick={fetchResults}>Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="empty">Loading...</div>
      ) : apartments.length === 0 ? (
        <div className="empty">No apartments found.</div>
      ) : (
        <div className="cards-grid">
          <ApartmentList items={apartments} cardMode />
        </div>
      )}
    </div>
  );
}
