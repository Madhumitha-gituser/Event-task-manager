import { formatEventDate } from '../../utils/formatEventDate';

export default function EventInformationSection({ event }) {
  return (
    <section className="event-details-info card-surface" aria-labelledby="event-info-heading">
      <h2 id="event-info-heading" className="event-details-section-title">
        Event information
      </h2>
      <dl className="event-details-dl">
        <div className="event-details-dl-row">
          <dt>Type</dt>
          <dd>{event.type}</dd>
        </div>
        <div className="event-details-dl-row">
          <dt>Date</dt>
          <dd>{formatEventDate(event.date)}</dd>
        </div>
        <div className="event-details-dl-row">
          <dt>Time</dt>
          <dd>{event.time}</dd>
        </div>
        <div className="event-details-dl-row">
          <dt>Venue</dt>
          <dd>{event.venue}</dd>
        </div>
        <div className="event-details-dl-row">
          <dt>Organizer</dt>
          <dd>{event.organizer}</dd>
        </div>
        <div className="event-details-dl-row">
          <dt>Max participants</dt>
          <dd>{event.max_participants}</dd>
        </div>
        {event.registration_link && (
          <div className="event-details-dl-row">
            <dt>Registration</dt>
            <dd>
              <a href={event.registration_link} target="_blank" rel="noreferrer">
                Link
              </a>
            </dd>
          </div>
        )}
        <div className="event-details-dl-row event-details-dl-row--block">
          <dt>Description</dt>
          <dd>{event.description}</dd>
        </div>
      </dl>
    </section>
  );
}
