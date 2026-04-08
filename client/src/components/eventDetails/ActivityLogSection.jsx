import './ActivityLogSection.css';

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ActivityLogSection({
  entries,
  onRemoveEntry,
  onClearAll,
  removingId,
  clearing,
  headingIdSuffix = '',
}) {
  const list = Array.isArray(entries) ? entries : [];
  const headingId = headingIdSuffix ? `activity-log-heading-${headingIdSuffix}` : 'activity-log-heading';

  return (
    <section className="activity-log card-surface" aria-labelledby={headingId}>
      <div className="activity-log__head">
        <h2 id={headingId} className="event-details-section-title">
          Activity
        </h2>
        {list.length > 0 && (
          <button
            type="button"
            className="activity-log__clear"
            onClick={onClearAll}
            disabled={clearing}
          >
            {clearing ? 'Clearing…' : 'Clear all'}
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="event-details-hint">No activity yet. Actions on this event will appear here.</p>
      ) : (
        <ul className="activity-log__list">
          {list.map((item) => (
            <li key={item.id} className="activity-log__item">
              <div className="activity-log__content">
                <span className="activity-log__time">{formatWhen(item.at)}</span>
                <span className="activity-log__who">{item.userName || 'Someone'}</span>
                <span className="activity-log__text">{item.summary}</span>
              </div>
              <button
                type="button"
                className="activity-log__remove"
                onClick={() => onRemoveEntry(item.id)}
                disabled={removingId === item.id}
                aria-label={`Remove activity: ${item.summary?.slice(0, 40) || 'entry'}`}
              >
                {removingId === item.id ? '…' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
