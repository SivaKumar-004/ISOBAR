// Local fallback loader for Chart.js
// This module injects the UMD build of Chart.js and resolves to the Chart constructor.
// It intentionally exports a Promise as the default export so callers can await it.

const loader = (async () => {
  if (typeof window !== 'undefined' && window.Chart) return window.Chart;

  // Insert UMD script tag to load Chart.js
  await new Promise((resolve, reject) => {
    try {
      const existing = document.querySelector('script[data-chart-umd]');
      if (existing) {
        // If already loading, wait for it to finish
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Chart.js UMD')));
        return;
      }

      const s = document.createElement('script');
      s.setAttribute('data-chart-umd', '1');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Chart.js UMD'));
      document.head.appendChild(s);
    } catch (e) {
      reject(e);
    }
  });

  if (window.Chart) return window.Chart;
  throw new Error('Chart.js did not attach to window after loading UMD');
})();

export default loader;
