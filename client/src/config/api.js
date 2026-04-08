/** Empty string = same-origin `/api` (Vite dev proxy or deployed reverse proxy). */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_BASE;
  if (raw === undefined || raw === '') return '';
  return String(raw).replace(/\/$/, '');
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const b = getApiBase();
  return b ? `${b}${p}` : p;
}
