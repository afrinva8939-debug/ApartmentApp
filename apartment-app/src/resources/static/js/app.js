const API_BASE = '/api/apartments';
let page = 0, size = 9, totalPages = 0;

const el = id => document.getElementById(id);

async function fetchApartments() {
  const q = el('search').value.trim();
  const sortVal = el('sort').value.split(':');
  const sortBy = sortVal[0] || 'aggDatetime';
  const order = sortVal[1] || 'desc';

  const url = new URL(API_BASE, location.origin);
  url.searchParams.set('page', page);
  url.searchParams.set('size', size);
  url.searchParams.set('sortBy', sortBy);
  url.searchParams.set('order', order);
  url.searchParams.set('q', q);

  const res = await fetch(url);
  if(!res.ok) {
    console.error('api error', await res.text());
    return;
  }
  const data = await res.json();
  renderGrid(data);
}

function parseRent(rentStr) {
  if(!rentStr) return null;
  const clean = rentStr.replace(/[^0-9]/g,'');
  return clean ? parseInt(clean, 10) : null;
}

function renderGrid(pageData) {
  const grid = el('grid');
  grid.innerHTML = '';
  el('count').textContent = pageData.totalElements ?? 0;
  totalPages = pageData.totalPages ?? 0;
  el('pageInfo').textContent = `Page ${page+1} of ${Math.max(totalPages,1)}`;

  (pageData.content || []).forEach(a => {
    const minRent = parseRent(a.minRent) ?? '-';
    const maxRent = parseRent(a.maxRent) ?? '-';
    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl p-4 card-hover';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold">${escapeHtml(a.apartmentName || 'Unnamed')}</h3>
          <p class="text-sm text-slate-500">${escapeHtml(a.address || '')}</p>
          <div class="mt-3 text-sm text-slate-600">Beds: ${escapeHtml(a.bed||'N/A')} · Baths: ${escapeHtml(a.bath||'N/A')}</div>
        </div>
        <div class
