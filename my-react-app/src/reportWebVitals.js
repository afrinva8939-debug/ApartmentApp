// safe wrapper for different web-vitals versions
// It will call whichever export names are available in the installed package.

import * as vitals from 'web-vitals';

export default function reportWebVitals(onPerfEntry) {
  if (typeof onPerfEntry !== 'function') return;

  // try older CRA names (getXYZ) first, then newer 'onXYZ' hooks
  const tryCall = (name) => {
    try {
      const fn = vitals[name];
      if (typeof fn === 'function') {
        // some functions take the callback directly
        fn(onPerfEntry);
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  // list of likely function names (covering versions)
  const candidates = [
    'getCLS', 'getFID', 'getLCP', 'getFCP', 'getTTFB',
    'onCLS', 'onFID', 'onLCP', 'onFCP', 'onTTFB', 'onINP'
  ];

  for (const name of candidates) {
    tryCall(name);
  }
}
