/** Parse event start from API date (often YYYY-MM-DD) and time (HH:mm). */
export function parseEventStart(dateStr, timeStr) {
  if (!dateStr) return null;
  const time = typeof timeStr === 'string' && timeStr.trim() ? timeStr.trim() : '00:00';
  const normalized = time.length === 5 ? `${time}:00` : time;
  const d = new Date(`${String(dateStr).slice(0, 10)}T${normalized}`);
  return Number.isNaN(d.getTime()) ? null : d;
}
