import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LIST } from '../constants/eventCategories';
import { fetchAllEvents } from '../services/eventsApi';
import EventSummaryCard from '../components/EventSummaryCard';
import './ViewEvents.css';

export default function ViewEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchAllEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      if (selectedCategory !== 'All') {
        const eventCategory = event.category?.toLowerCase();
        const selectedLower = selectedCategory.toLowerCase();
        if (eventCategory !== selectedLower) return false;
      }
      if (!q) return true;
      const hay = `${event.title ?? ''} ${event.type ?? ''} ${event.category ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [selectedCategory, events, searchQuery]);

  return (
    <div className="view-events">
      <main className="view-events-main">
        <div className="view-events-header-section">
          <div>
            <h1 className="view-events-title">View events</h1>
            <p className="view-events-subtitle">
              Browse and filter events here. Use <strong>Manage event</strong> on a card to open the full screen for
              details, participants, and tasks.
            </p>
          </div>

          <div className="view-events-toolbar">
            <div className="view-events-search">
              <label htmlFor="event-search">Search</label>
              <input
                id="event-search"
                type="search"
                placeholder="Title, type, or category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="view-events-filter">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All categories</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="view-events-error">{error}</div>}

        {loading ? (
          <div className="view-events-loading">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="view-events-empty">
            <p>
              No events found.
              {(selectedCategory !== 'All' || searchQuery.trim()) && ' Try adjusting search or category.'}
            </p>
          </div>
        ) : (
          <>
            <div className="view-events-grid">
              {filteredEvents.map((event) => (
                <EventSummaryCard
                  key={event.id}
                  event={event}
                  onManage={(eventId) =>
                    navigate(`/events/${eventId}`, { state: { from: '/view-events' } })
                  }
                />
              ))}
            </div>
            <div className="view-events-info">
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
