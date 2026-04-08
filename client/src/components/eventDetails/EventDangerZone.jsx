import './EventDangerZone.css';

export default function EventDangerZone({ onDeleteEvent, deleting }) {
  return (
    <section className="event-danger-zone card-surface" aria-labelledby="danger-zone-heading">
      <h2 id="danger-zone-heading" className="event-danger-zone__title">
        Danger zone
      </h2>
      <p className="event-danger-zone__text">
        Permanently delete this event, including all participants, tasks, and activity. This cannot be undone.
      </p>
      <button
        type="button"
        className="event-danger-zone__btn"
        onClick={onDeleteEvent}
        disabled={deleting}
      >
        {deleting ? 'Deleting…' : 'Delete this event'}
      </button>
    </section>
  );
}
