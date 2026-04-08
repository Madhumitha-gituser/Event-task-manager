/** Production API URL - hardcoded for Netlify deployment */
const PRODUCTION_API_URL = 'https://event-task-manager-p2i7.onrender.com/api';

export function getApiBase() {
  // If on localhost (development), use relative path for Vite proxy
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '';
  }
  
  // For all other environments (production), use full Render URL
  return PRODUCTION_API_URL;
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const b = getApiBase();
  return b ? `${b}${p}` : p;
}
