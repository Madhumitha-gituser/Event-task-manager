import { useEffect, useState } from 'react';
import { parseEventStart } from '../../utils/eventDateTime';
import './EventCountdown.css';

function formatRemaining(ms) {
  if (ms <= 0) return null;
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function EventCountdown({ date, time }) {
  const [now, setNow] = useState(() => Date.now());

  const start = parseEventStart(date, time);

  useEffect(() => {
    if (!start) return undefined;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);

  if (!start) return null;

  const diff = start.getTime() - now;

  let message;
  if (diff > 0) {
    const parts = formatRemaining(diff);
    message = parts ? `Starts in ${parts}` : 'Starting soon';
  } else {
    message = 'This event date has passed';
  }

  return (
    <div className="event-countdown" role="status">
      <span className="event-countdown__label">Countdown</span>
      <span className="event-countdown__value">{message}</span>
    </div>
  );
}
