import { apiUrl } from '../config/api.js';

const TOKEN_KEY = 'event_task_manager_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

function authJsonHeaders() {
  return {
    'Content-Type': 'application/json',
    ...authHeaders(),
  };
}

async function handleJson(res) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      /* non-JSON (e.g. old Express "Cannot DELETE …" HTML page) */
    }
  }
  if (!res.ok) {
    const trimmed = text?.trimStart() ?? '';
    const looksHtml =
      trimmed.toLowerCase().startsWith('<!doctype') ||
      trimmed.toLowerCase().startsWith('<html') ||
      trimmed.includes('<title>Error</title>');
    const detail =
      data.error ||
      data.message ||
      (!looksHtml && trimmed ? trimmed.slice(0, 200).trim() : null);
    if (res.status === 404 && (!detail || looksHtml)) {
      throw new Error(
        'API returned 404 for this request (often an HTML error page). Restart the backend from the server folder (npm run dev), or run both apps together: from client, npm run dev:all.'
      );
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response from API');
  }
}

export async function fetchAllEvents() {
  const res = await fetch(apiUrl('/api/events'));
  return handleJson(res);
}

export async function fetchEventById(id) {
  const res = await fetch(apiUrl(`/api/events/${encodeURIComponent(String(id))}`), {
    headers: authHeaders(),
  });
  return handleJson(res);
}

export async function addParticipant(eventId, { usn, name }) {
  const res = await fetch(apiUrl(`/api/events/${eventId}/participants`), {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify({ usn, name }),
  });
  return handleJson(res);
}

export async function addTask(eventId, payload) {
  const res = await fetch(apiUrl(`/api/events/${eventId}/tasks`), {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function updateTaskStatus(eventId, taskId, status) {
  const res = await fetch(apiUrl(`/api/events/${eventId}/tasks/${taskId}/status`), {
    method: 'PATCH',
    headers: authJsonHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleJson(res);
}

export async function bulkUpdateTasks(eventId, body) {
  const res = await fetch(apiUrl(`/api/events/${eventId}/tasks/bulk`), {
    method: 'PATCH',
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  });
  return handleJson(res);
}

function deleteAuthFetch(path) {
  return fetch(apiUrl(path), {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function deleteTask(eventId, taskId) {
  const eid = encodeURIComponent(String(eventId));
  const tid = encodeURIComponent(String(taskId));
  const res = await deleteAuthFetch(`/api/events/${eid}/tasks/${tid}`);
  return handleJson(res);
}

export async function deleteParticipant(eventId, participantId) {
  const eid = encodeURIComponent(String(eventId));
  const pid = encodeURIComponent(String(participantId));
  const res = await deleteAuthFetch(`/api/events/${eid}/participants/${pid}`);
  return handleJson(res);
}

export async function deleteActivityEntry(eventId, activityEntryId) {
  const eid = encodeURIComponent(String(eventId));
  const aid = encodeURIComponent(String(activityEntryId));
  const res = await deleteAuthFetch(`/api/events/${eid}/activity/${aid}`);
  return handleJson(res);
}

export async function clearActivityLog(eventId) {
  const eid = encodeURIComponent(String(eventId));
  const res = await deleteAuthFetch(`/api/events/${eid}/activity`);
  return handleJson(res);
}

export async function deleteEvent(eventId) {
  const eid = encodeURIComponent(String(eventId));
  const res = await deleteAuthFetch(`/api/events/${eid}`);
  return handleJson(res);
}
