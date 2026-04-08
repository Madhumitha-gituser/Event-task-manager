export default function ParticipantsSection({
  participants,
  form,
  onFormChange,
  onSubmit,
  submitting,
  onRemoveParticipant,
  removingParticipantId,
}) {
  return (
    <section className="event-details-participants card-surface" aria-labelledby="participants-heading">
      <h2 id="participants-heading" className="event-details-section-title">
        Participants
      </h2>
      <form className="event-details-form" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="participant-usn">USN</label>
            <input
              id="participant-usn"
              value={form.usn}
              onChange={(e) => onFormChange({ ...form, usn: e.target.value })}
              placeholder="e.g. 1MS21CS001"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="participant-name">Student name</label>
            <input
              id="participant-name"
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add participant'}
        </button>
      </form>

      {participants.length === 0 ? (
        <p className="event-details-hint">No participants yet. Add students to assign tasks.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>USN</th>
                <th>Student name</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.usn}</td>
                  <td>{p.name}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-remove-row"
                      onClick={() => onRemoveParticipant(p)}
                      disabled={removingParticipantId === p.id}
                    >
                      {removingParticipantId === p.id ? '…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
