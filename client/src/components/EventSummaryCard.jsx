import { formatEventDate } from '../utils/formatEventDate';
import './EventSummaryCard.css';

export default function EventSummaryCard({ event, onManage }) {
  const category = event.category || '—';
  const title = event.title || 'Untitled';

  return (
    <article className="event-summary-card">
      <div className="event-summary-card__header">
        <h3 className="event-summary-card__title">{title}</h3>
        <span className="event-summary-card__badge">{category}</span>
      </div>
      <div className="event-summary-card__body">
        <div className="event-summary-card__row">
          <span className="event-summary-card__label">Type</span>
          <span className="event-summary-card__value">{event.type}</span>
        </div>
        <div className="event-summary-card__row">
          <span className="event-summary-card__label">Date</span>
          <span className="event-summary-card__value">{formatEventDate(event.date)}</span>
        </div>
        <div className="event-summary-card__row">
          <span className="event-summary-card__label">Time</span>
          <span className="event-summary-card__value">{event.time}</span>
        </div>
      </div>
      <div className="event-summary-card__footer">
        <button type="button" className="event-summary-card__cta" onClick={() => onManage(event.id)}>
          Manage event
        </button>
      </div>
    </article>
  );
}
