import EventCountdown from './EventCountdown';

export default function EventDetailsHeader({ title, category, date, time, onBack }) {
  const badge = category || '—';

  return (
    <>
      <button type="button" className="event-details-back" onClick={onBack}>
        ← Back to events
      </button>
      <header className="event-details-header">
        <div>
          <h1 className="event-details-title">{title}</h1>
          <p className="event-details-meta">
            <span className="event-details-badge">{badge}</span>
          </p>
          <EventCountdown date={date} time={time} />
        </div>
      </header>
    </>
  );
}
