export function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr ?? '');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTaskDeadline(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return String(dateStr);
}

/** @param {{ deadline: string, deadlineTime?: string | null }} task */
export function formatTaskDeadlineDisplay(task) {
  const d = formatTaskDeadline(task.deadline);
  if (task.deadlineTime) return `${d} · ${task.deadlineTime}`;
  return d;
}
