import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [name, setName] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [bed, setBed] = useState('');
  const [bath, setBath] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSearch({ name: name.trim(), state: stateVal.trim(), bed: bed.trim(), bath: bath.trim() });
  }

  function handleReset() {
    setName(''); setStateVal(''); setBed(''); setBath('');
    onSearch({ name: '', state: '', bed: '', bath: '' });
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div className="search-wrapper" style={{ justifyContent: 'center' }}>
        <input
          className="search-input"
          placeholder="Apartment name (or address)"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: 380 }}
        />
        <input
          className="search-input"
          placeholder="State (e.g., TX)"
          value={stateVal}
          onChange={e => setStateVal(e.target.value)}
          style={{ width: 110 }}
        />
        <input
          className="search-input"
          placeholder="Beds (e.g., 2)"
          value={bed}
          onChange={e => setBed(e.target.value)}
          style={{ width: 110 }}
        />
        <input
          className="search-input"
          placeholder="Baths (e.g., 1)"
          value={bath}
          onChange={e => setBath(e.target.value)}
          style={{ width: 110 }}
        />

        <button type="submit" className="btn" style={{ marginLeft: 6 }}>Search</button>
        <button type="button" onClick={handleReset} className="btn secondary" style={{ marginLeft: 6 }}>Reset</button>
      </div>
    </form>
  );
}
