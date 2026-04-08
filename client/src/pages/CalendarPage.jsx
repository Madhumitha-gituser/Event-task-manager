import { useEffect, useMemo, useState } from 'react';
import { fetchAllEvents } from '../services/eventsApi';
import './CalendarPage.css';

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllEvents();
        if (!cancelled) setEvents(data.events || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      if (!ev.date) continue;
      const key = String(ev.date).slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => {
    const start = startOfMonth(cursor);
    const firstDow = start.getDay();
    const total = daysInMonth(cursor);
    const cells = [];
    for (let i = 0; i < firstDow; i += 1) cells.push({ type: 'empty', key: `e-${i}` });
    for (let day = 1; day <= total; day += 1) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ type: 'day', day, iso, key: iso });
    }
    return cells;
  }, [cursor]);

  const label = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-page">
      <main className="calendar-page__main">
        <header className="calendar-page__header">
          <h1 className="calendar-page__title">Calendar</h1>
          <div className="calendar-page__nav">
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              ←
            </button>
            <span className="calendar-page__label">{label}</span>
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              →
            </button>
          </div>
        </header>

        {error && <div className="calendar-page__error">{error}</div>}
        {loading ? (
          <div className="calendar-page__loading">Loading calendar…</div>
        ) : (
          <>
            <div className="calendar-grid" role="grid" aria-label={`Calendar ${label}`}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="calendar-grid__dow" role="columnheader">
                  {d}
                </div>
              ))}
              {grid.map((cell) => {
                if (cell.type === 'empty') {
                  return <div key={cell.key} className="calendar-grid__cell calendar-grid__cell--empty" />;
                }
                const list = byDay.get(cell.iso) || [];
                return (
                  <div key={cell.key} className="calendar-grid__cell">
                    <span className="calendar-grid__num">{cell.day}</span>
                    <ul className="calendar-grid__dots">
                      {list.slice(0, 3).map((ev) => (
                        <li key={ev.id} className="calendar-grid__dot" title={`${ev.title} · ${ev.time}`}>
                          {ev.title}
                        </li>
                      ))}
                      {list.length > 3 && <li className="calendar-grid__more">+{list.length - 3}</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="calendar-page__hint">
              Event dates use the stored date field. Open <strong>View events</strong> for full details (
              {events.length} total).
            </p>
          </>
        )}
      </main>
    </div>
  );
}
