/** Use Render backend URL in production, or local proxy in development */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_BASE;
  
  // If explicitly set via env var, use it
  if (raw && raw !== '') {
    return String(raw).replace(/\/$/, '');
  }
  
  // In development (localhost), use relative path for proxy
  if (window.location.hostname === 'localhost') {
    return '';
  }
  
  // In production, use Render backend URL
  return 'https://event-task-manager-p2i7.onrender.com/api';
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const b = getApiBase();
  return b ? `${b}${p}` : p;
}
