const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskAssignmentSection({
  participants,
  form,
  onFormChange,
  onSubmit,
  submitting,
  noParticipants,
}) {
  return (
    <section className="event-details-tasks card-surface" aria-labelledby="task-assign-heading">
      <h2 id="task-assign-heading" className="event-details-section-title">
        Task assignment
      </h2>
      <form className="event-details-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="task-name">Task name</label>
          <input
            id="task-name"
            value={form.taskName}
            onChange={(e) => onFormChange({ ...form, taskName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="task-notes">Notes (optional)</label>
          <textarea
            id="task-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
            placeholder="Context, checklist, links to docs…"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-participant">Participant</label>
            <select
              id="task-participant"
              value={form.assignedToParticipantId}
              onChange={(e) => onFormChange({ ...form, assignedToParticipantId: e.target.value })}
              disabled={noParticipants}
              required={!noParticipants}
            >
              <option value="">{noParticipants ? 'Add a participant first' : 'Select participant'}</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.usn} - {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="task-deadline">Deadline (date)</label>
            <input
              id="task-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => onFormChange({ ...form, deadline: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-deadline-time">Deadline time (optional)</label>
            <input
              id="task-deadline-time"
              type="time"
              value={form.deadlineTime}
              onChange={(e) => onFormChange({ ...form, deadlineTime: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) => onFormChange({ ...form, priority: e.target.value })}
              required={!noParticipants}
              disabled={noParticipants}
            >
              <option value="">{noParticipants ? 'Add a participant first' : 'Select priority'}</option>
              {PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-reminder">Reminder (optional)</label>
            <input
              id="task-reminder"
              type="datetime-local"
              value={form.reminderAt}
              onChange={(e) => onFormChange({ ...form, reminderAt: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-attachment">Attachment link (optional)</label>
            <input
              id="task-attachment"
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={form.attachmentUrl}
              onChange={(e) => onFormChange({ ...form, attachmentUrl: e.target.value })}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting || noParticipants}>
          {submitting ? 'Assigning…' : 'Assign Task'}
        </button>
      </form>
    </section>
  );
}
