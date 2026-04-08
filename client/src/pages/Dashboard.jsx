import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllEvents } from '../services/eventsApi';
import { formatEventDate } from '../utils/formatEventDate';
import { parseEventStart } from '../utils/eventDateTime';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchAllEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const { tasksPending, tasksCompleted } = useMemo(() => {
    return events.reduce(
      (acc, ev) => {
        const tasks = ev.tasks || [];
        for (const t of tasks) {
          if (t.status === 'Pending') acc.tasksPending += 1;
          else if (t.status === 'Completed') acc.tasksCompleted += 1;
        }
        return acc;
      },
      { tasksPending: 0, tasksCompleted: 0 }
    );
  }, [events]);

  const nextEventSummary = useMemo(() => {
    if (!events.length) return null;
    const now = Date.now();
    const withStart = events
      .map((e) => ({ event: e, start: parseEventStart(e.date, e.time) }))
      .filter((x) => x.start && x.start.getTime() >= now)
      .sort((a, b) => a.start - b.start);
    if (withStart.length === 0) return null;
    const { event: ev } = withStart[0];
    return {
      title: ev.title,
      when: formatEventDate(ev.date),
      time: ev.time,
    };
  }, [events]);

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <h1>Welcome Back 👋</h1>
          <p>Here's a summary of your upcoming events</p>
          {nextEventSummary && (
            <p className="dashboard-next-event">
              Next up: <strong>{nextEventSummary.title}</strong> on {nextEventSummary.when} at {nextEventSummary.time}
            </p>
          )}
        </section>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{events.length}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{tasksPending}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{tasksCompleted}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>

        <section className="dashboard-events-section">
          <div className="section-header">
            <div>
              <h3>Upcoming events</h3>
              <p className="dashboard-events-hint">
                Open <strong>Manage event</strong> on a card for participants and tasks, or use View all for filters.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/view-events')} className="view-all-link">
              View all →
            </button>
          </div>

          {error && <div className="dashboard-error">{error}</div>}

          {loading ? (
            <div className="dashboard-loading">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="dashboard-empty">
              <p>No events created yet.</p>
              <button
                type="button"
                onClick={() => navigate('/create-event')}
                className="dashboard-create-btn"
              >
                Create your first event
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <h4 className="event-title">{event.title}</h4>
                    <span className="event-type-badge">{event.category || event.type}</span>
                  </div>
                  <div className="event-card-body">
                    <div className="event-detail">
                      <span className="label">Event Type:</span>
                      <span className="value">{event.type}</span>
                    </div>
                    <div className="event-detail">
                      <span className="label">Date:</span>
                      <span className="value">{formatEventDate(event.date)}</span>
                    </div>
                    <div className="event-detail">
                      <span className="label">Time:</span>
                      <span className="value">{event.time}</span>
                    </div>
                  </div>
                  <div className="event-card-footer">
                  {/*
                    <button
                      type="button"
                      className="event-card-manage-btn"
                      onClick={() => navigate(`/events/${event.id}`, { state: { from: '/dashboard' } })}
                    >
                      Manage event
                    </button>
                    */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
