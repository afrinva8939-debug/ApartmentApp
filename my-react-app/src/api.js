// my-react-app/src/api.js
// Small client wrapper for your backend API.
// Uses REACT_APP_API_BASE if set (ngrok or remote).
// Otherwise uses relative paths so CRA proxy can forward to http://localhost:5000 (dev).

const BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, ''); // no trailing slash

export async function fetchResults(filters = {}) {
  const qs = new URLSearchParams(filters).toString();
  const url = `${BASE || ''}/api/results${qs ? '?' + qs : ''}`;

  const res = await fetch(url, {
    credentials: 'same-origin', // adjust if needed
  });

  // If server sent back HTML (eg. ngrok landing page or index.html), read text and throw a descriptive error
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  // If content-type looks like JSON, parse; otherwise show first bit of response for debugging.
  if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error('Failed parse JSON from server: ' + err.message + ' — response start: ' + text.slice(0, 300));
    }
  }

  throw new Error('Expected JSON but server returned: ' + text.slice(0, 300));
}

export default { fetchResults };
