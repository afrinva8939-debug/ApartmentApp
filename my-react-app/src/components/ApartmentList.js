import React from 'react';

/**
 * ApartmentList supports:
 * - items: array of apartment objects
 * - cardMode (boolean): if true, styles cards for usage inside .cards-grid
 */
export default function ApartmentList({ items, cardMode }) {
  if (!items || items.length === 0) {
    return <div className="empty">No apartments found.</div>;
  }

  // If cardMode, each item should already be wrapped by .cards-grid in ResultsPage.
  if (cardMode) {
    return (
      <>
        {items.map(item => (
          <div key={item.id} className="card">
            <div>
              <div className="card-title">{item.apt_result_apartment_name} <small style={{ color: 'var(--muted)', marginLeft: 6 }}>{item.apt_result_unit_number}</small></div>
              <div className="card-sub">{item.apt_result_address}</div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="tag">{item.apt_result_floorplan}</div>
                <div className="tag">{item.apt_result_sqft}</div>
                <div className="tag">{item.apt_result_bed}</div>
                <div className="tag">{item.apt_result_bath}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="price">{item.apt_result_min_rent} - {item.apt_result_max_rent}</div>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>{item.apt_result_available_date}</div>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>State: {item.state}</div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // fallback plain list (used previously)
  return (
    <div style={{ maxWidth: 1100, margin: '30px auto', padding: '0 12px' }}>
      {items.map(item => (
        <div key={item.id} style={{
          border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 12,
        }}>
          <h2 style={{ margin: 0 }}>{item.apt_result_apartment_name}</h2>
          <div style={{ color: '#555' }}>{item.apt_result_address}</div>
        </div>
      ))}
    </div>
  );
}
