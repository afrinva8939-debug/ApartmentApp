import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function SearchPage() {
  const navigate = useNavigate();

  function handleSearch(filters) {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.state) params.append('state', filters.state);
    if (filters.bed) params.append('bed', filters.bed);
    if (filters.bath) params.append('bath', filters.bath);
    navigate(`/results?${params.toString()}`);
  }

  return (
    <div className="search-page">
      <div style={{ textAlign: 'center', maxWidth: 980, width: '100%' }}>
        <h1 className="app-title">ApartmentDetails</h1>
        <p style={{ color: 'rgba(50,20,70,0.7)', marginTop: 6 }}>
          Find apartments quickly — search by name, state, beds or baths
        </p>

        <div style={{ marginTop: 22 }} className="search-wrapper">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
}
