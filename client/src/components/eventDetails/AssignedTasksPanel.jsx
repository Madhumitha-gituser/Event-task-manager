import { useMemo, useEffect, useState } from 'react';
import { formatTaskDeadlineDisplay } from '../../utils/formatEventDate';
import './AssignedTasksPanel.css';

export default function AssignedTasksPanel({
  tasks,
  participants,
  eventId,
  selectedIds,
  onSelectedChange,
  onToggleStatus,
  onBulkComplete,
  onBulkReassign,
  statusUpdatingId,
  bulkWorking,
  onDeleteTask,
  deletingTaskId,
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortDeadline, setSortDeadline] = useState('asc');
  const [bulkReassignId, setBulkReassignId] = useState('');

  const displayed = useMemo(() => {
    let list = [...tasks];
    if (filterStatus !== 'All') list = list.filter((t) => t.status === filterStatus);
    if (filterAssignee !== 'All') {
      list = list.filter((t) => String(t.assignedToParticipantId) === filterAssignee);
    }
    if (filterPriority !== 'All') list = list.filter((t) => t.priority === filterPriority);

    list.sort((a, b) => {
      const ta = a.deadlineTime ? `${a.deadline}T${a.deadlineTime}` : `${a.deadline}T00:00:00`;
      const tb = b.deadlineTime ? `${b.deadline}T${b.deadlineTime}` : `${b.deadline}T00:00:00`;
      const da = new Date(ta);
      const db = new Date(tb);
      const va = Number.isNaN(da.getTime()) ? 0 : da.getTime();
      const vb = Number.isNaN(db.getTime()) ? 0 : db.getTime();
      return sortDeadline === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [tasks, filterStatus, filterAssignee, filterPriority, sortDeadline]);

  const allVisibleSelected =
    displayed.length > 0 && displayed.every((t) => selectedIds.has(t.id));

  const toggleRow = (taskId) => {
    const next = new Set(selectedIds);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    onSelectedChange(next);
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      onSelectedChange(new Set());
    } else {
      onSelectedChange(new Set(displayed.map((t) => t.id)));
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedIds.size > 0) {
        onSelectedChange(new Set());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds.size, onSelectedChange]);

  const exportCsv = () => {
    const rows = [
      [
        'Task Name',
        'Student',
        'USN',
        'Deadline',
        'Time',
        'Priority',
        'Status',
        'Notes',
        'Reminder',
        'Attachment',
      ],
    ];
    for (const t of tasks) {
      rows.push([
        t.taskName,
        t.assignedToName,
        t.assignedToUSN,
        t.deadline,
        t.deadlineTime || '',
        t.priority,
        t.status,
        (t.notes || '').replace(/\r?\n/g, ' '),
        t.reminderAt || '',
        t.attachmentUrl || '',
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}-tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCount = selectedIds.size;

  return (
    <section className="assigned-tasks-panel card-surface" aria-labelledby="assigned-tasks-heading">
      <div className="assigned-tasks-panel__head">
        <h2 id="assigned-tasks-heading" className="event-details-section-title">
          Assigned tasks
        </h2>
        <button type="button" className="btn-ghost" onClick={exportCsv} disabled={tasks.length === 0}>
          Export CSV
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="event-details-tasks-empty">
          <p>No tasks assigned yet.</p>
          <p className="event-details-hint">
            Add participants, then assign work with a deadline and priority. Tasks start as Pending.
          </p>
        </div>
      ) : (
        <>
          <div className="task-filters" role="group" aria-label="Filter tasks">
            <div className="form-group task-filters__field">
              <label htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-group task-filters__field">
              <label htmlFor="filter-assignee">Assignee</label>
              <select
                id="filter-assignee"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="All">All</option>
                {participants.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.usn} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group task-filters__field">
              <label htmlFor="filter-priority">Priority</label>
              <select
                id="filter-priority"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group task-filters__field">
              <label htmlFor="sort-deadline">Sort by deadline</label>
              <select
                id="sort-deadline"
                value={sortDeadline}
                onChange={(e) => setSortDeadline(e.target.value)}
              >
                <option value="asc">Soonest first</option>
                <option value="desc">Latest first</option>
              </select>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="task-bulk-bar" role="region" aria-label="Bulk actions">
              <span className="task-bulk-bar__count">{selectedCount} selected</span>
              <div className="task-bulk-bar__actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={bulkWorking}
                  onClick={() => onBulkComplete()}
                >
                  Mark completed
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={bulkWorking || !bulkReassignId}
                  onClick={() => onBulkReassign(Number(bulkReassignId))}
                >
                  Reassign
                </button>
                <select
                  className="task-bulk-bar__select"
                  value={bulkReassignId}
                  onChange={(e) => setBulkReassignId(e.target.value)}
                  aria-label="Reassign to participant"
                >
                  <option value="">Select…</option>
                  {participants.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.usn} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="task-bulk-bar__hint">Esc clears selection</span>
            </div>
          )}

          <div className="task-panel__table-wrap table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th-check">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      aria-label="Select all visible tasks"
                    />
                  </th>
                  <th>Task name</th>
                  <th>Student</th>
                  <th>USN</th>
                  <th>Deadline</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleRow(t.id)}
                        aria-label={`Select ${t.taskName}`}
                      />
                    </td>
                    <td>
                      <div className="task-cell__name">{t.taskName}</div>
                      {t.notes ? <div className="task-cell__notes">{t.notes}</div> : null}
                      {t.reminderAt ? (
                        <div className="task-cell__notes">
                          Reminder: {new Date(t.reminderAt).toLocaleString()}
                        </div>
                      ) : null}
                      {t.attachmentUrl ? (
                        <a
                          className="task-cell__link"
                          href={t.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Attachment
                        </a>
                      ) : null}
                    </td>
                    <td>{t.assignedToName}</td>
                    <td>{t.assignedToUSN}</td>
                    <td>{formatTaskDeadlineDisplay(t)}</td>
                    <td>
                      <span className={`priority-pill priority-pill--${t.priority?.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${t.status === 'Completed' ? 'status-pill--done' : ''}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="task-actions-cell">
                        <button
                          type="button"
                          className="btn-secondary btn-compact"
                          onClick={() => onToggleStatus(t)}
                          disabled={statusUpdatingId === t.id}
                        >
                          {statusUpdatingId === t.id
                            ? '…'
                            : t.status === 'Pending'
                              ? 'Mark completed'
                              : 'Mark pending'}
                        </button>
                        <button
                          type="button"
                          className="btn-remove-row btn-compact"
                          onClick={() => onDeleteTask(t)}
                          disabled={deletingTaskId === t.id || statusUpdatingId === t.id}
                        >
                          {deletingTaskId === t.id ? '…' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="task-panel__cards" aria-label="Task cards">
            {displayed.map((t) => (
              <article key={t.id} className="task-card">
                <label className="task-card__check">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggleRow(t.id)}
                  />
                  <span className="task-card__title">{t.taskName}</span>
                </label>
                <div className="task-card__meta">
                  <span>
                    {t.assignedToName} · {t.assignedToUSN}
                  </span>
                  <span>{formatTaskDeadlineDisplay(t)}</span>
                  <span className={`priority-pill priority-pill--${t.priority?.toLowerCase()}`}>
                    {t.priority}
                  </span>
                  <span className={`status-pill ${t.status === 'Completed' ? 'status-pill--done' : ''}`}>
                    {t.status}
                  </span>
                </div>
                {t.notes ? <p className="task-card__notes">{t.notes}</p> : null}
                {t.reminderAt ? (
                  <p className="task-card__notes">Reminder: {new Date(t.reminderAt).toLocaleString()}</p>
                ) : null}
                {t.attachmentUrl ? (
                  <a className="task-cell__link" href={t.attachmentUrl} target="_blank" rel="noreferrer">
                    Attachment
                  </a>
                ) : null}
                <div className="task-card__actions">
                  <button
                    type="button"
                    className="btn-secondary btn-compact task-card__action"
                    onClick={() => onToggleStatus(t)}
                    disabled={statusUpdatingId === t.id}
                  >
                    {statusUpdatingId === t.id
                      ? 'Updating…'
                      : t.status === 'Pending'
                        ? 'Mark completed'
                        : 'Mark pending'}
                  </button>
                  <button
                    type="button"
                    className="btn-remove-row btn-compact"
                    onClick={() => onDeleteTask(t)}
                    disabled={deletingTaskId === t.id || statusUpdatingId === t.id}
                  >
                    {deletingTaskId === t.id ? 'Removing…' : 'Remove task'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {displayed.length === 0 && (
            <p className="event-details-hint">No tasks match the current filters.</p>
          )}
        </>
      )}
    </section>
  );
}
