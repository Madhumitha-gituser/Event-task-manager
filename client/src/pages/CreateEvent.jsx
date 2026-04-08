import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CATEGORY_LIST } from '../constants/eventCategories';
import { apiUrl } from '../config/api';
import './CreateEvent.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    category: '',
    type: '',
    date: '',
    time: '',
    title: '',
    description: '',
    venue: '',
    organizer: '',
    max_participants: '',
    registration_link: '',
  });

  const eventTypes = form.category ? CATEGORIES[form.category] || [] : [];

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setForm((prev) => ({
      ...prev,
      category: newCategory,
      type: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('event_task_manager_token');

      const response = await fetch(apiUrl('/api/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: form.category,
          type: form.type,
          date: form.date,
          time: form.time,
          title: form.title.trim() || `${form.category} - ${form.type}`,
          description: form.description.trim(),
          venue: form.venue.trim(),
          organizer: form.organizer.trim(),
          max_participants: Number.parseInt(form.max_participants, 10),
          registration_link: form.registration_link.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const data = await response.json();
      const newId = data.event?.id;
      if (newId != null) {
        navigate(`/events/${newId}`, { state: { from: '/create-event' } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create event');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <div className="create-event-container">
        <div className="create-event-card">
          <h1 className="create-event-heading">Create New Event</h1>

          {error && <div className="create-event-error">{error}</div>}

          <form onSubmit={handleSubmit} className="create-event-form">
            {/* Category Field */}
            <div className="form-group">
              <label htmlFor="category">Event Category *</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select category</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Field */}
            <div className="form-group">
              <label htmlFor="type">Event Type *</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                disabled={!form.category}
              >
                <option value="">{form.category ? 'Select type' : 'Choose a category first'}</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Field */}
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Time Field */}
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Event title (optional)</label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={`Defaults to “${form.category && form.type ? `${form.category} - ${form.type}` : 'Category - Type'}”`}
                autoComplete="off"
              />
              <p className="create-event-hint">If empty, the title will be your category and type.</p>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                required
                placeholder="What is this event about? Who should attend?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue *</label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                required
                placeholder="Building, room, or online link"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organizer">Organizer *</label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
                required
                placeholder="Person or committee name"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_participants">Max participants *</label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                min={1}
                step={1}
                value={form.max_participants}
                onChange={handleChange}
                required
                placeholder="e.g. 50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registration_link">Registration link (optional)</label>
              <input
                type="url"
                id="registration_link"
                name="registration_link"
                value={form.registration_link}
                onChange={handleChange}
                placeholder="https://…"
                inputMode="url"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="create-event-submit">
              {loading ? 'Creating...' : 'Create Event'}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="create-event-cancel"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
