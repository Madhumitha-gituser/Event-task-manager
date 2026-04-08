import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllEvents, deleteActivityEntry, clearActivityLog } from '../services/eventsApi';
import { useToast } from '../context/ToastContext';
import ActivityLogSection from '../components/eventDetails/ActivityLogSection';
import './ActivityLogsPage.css';

export default function ActivityLogsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingActivityId, setRemovingActivityId] = useState(null);
  const [clearingEventId, setClearingEventId] = useState(null);

  const loadEvents = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchAllEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRemoveEntry = async (eventId, activityEntryId) => {
    if (!window.confirm('Remove this activity line from the log?')) return;
    setRemovingActivityId(activityEntryId);
    try {
      const data = await deleteActivityEntry(eventId, activityEntryId);
      setEvents((prev) =>
        prev.map((ev) => (Number(ev.id) === Number(eventId) ? data.event : ev))
      );
      toast.success('Activity entry removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove entry');
      await loadEvents();
    } finally {
      setRemovingActivityId(null);
    }
  };

  const handleClearAll = async (eventId) => {
    if (
      !window.confirm(
        'Clear the entire activity log for this event? This cannot be undone.'
      )
    ) {
      return;
    }
    setClearingEventId(eventId);
    try {
      const data = await clearActivityLog(eventId);
      setEvents((prev) =>
        prev.map((ev) => (Number(ev.id) === Number(eventId) ? data.event : ev))
      );
      toast.success('Activity log cleared');
    } catch (err) {
      toast.error(err.message || 'Failed to clear activity');
      await loadEvents();
    } finally {
      setClearingEventId(null);
    }
  };

  const sortedEvents = [...events].sort((a, b) =>
    String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' })
  );

  return (
    <div className="activity-logs-page">
      <main className="activity-logs-page__main">
        <header className="activity-logs-page__header">
          <div>
            <h1 className="activity-logs-page__title">Activity logs</h1>
            <p className="activity-logs-page__subtitle">
              Audit trail for every event: creates, participants, tasks, and removals. Open an event
              from View events to add or change work; manage the log here.
            </p>
          </div>
        </header>

        {error && <div className="activity-logs-page__error">{error}</div>}

        {loading ? (
          <div className="activity-logs-page__loading" role="status">
            Loading activity…
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="activity-logs-page__empty card-surface">
            <p>No events yet. Create an event to start seeing activity here.</p>
            <button type="button" className="activity-logs-page__cta" onClick={() => navigate('/create-event')}>
              Create event
            </button>
          </div>
        ) : (
          <div className="activity-logs-page__list">
            {sortedEvents.map((ev) => {
              const log = ev.activityLog ?? [];
              return (
                <article key={ev.id} className="activity-logs-page__event-block">
                  <div className="activity-logs-page__event-head">
                    <h2 className="activity-logs-page__event-title">{ev.title || 'Untitled event'}</h2>
                    <button
                      type="button"
                      className="activity-logs-page__manage"
                      onClick={() =>
                        navigate(`/events/${ev.id}`, { state: { from: '/activity-logs' } })
                      }
                    >
                      Manage event
                    </button>
                  </div>
                  <ActivityLogSection
                    headingIdSuffix={String(ev.id)}
                    entries={log}
                    onRemoveEntry={(entryId) => handleRemoveEntry(ev.id, entryId)}
                    onClearAll={() => handleClearAll(ev.id)}
                    removingId={removingActivityId}
                    clearing={clearingEventId === ev.id}
                  />
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
