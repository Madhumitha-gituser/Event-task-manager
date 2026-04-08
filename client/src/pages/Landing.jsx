import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Landing.css';

export default function Landing() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__brand">
          <Logo size={36} />
          <span className="landing__brand-text">Event Task Manager</span>
        </div>
        <Link to="/login" className="landing__cta landing__cta--ghost">
          Sign in
        </Link>
      </header>

      <main className="landing__main">
        <section className="landing__hero">
          <h1 className="landing__title">Run events with clarity</h1>
          <p className="landing__lead">
            One place for schedules, participants, and task ownership—so nothing slips through the cracks.
          </p>
          <div className="landing__actions">
            <Link to="/login" className="landing__cta landing__cta--primary">
              Get started
            </Link>
          </div>
        </section>

        <section className="landing__preview" aria-label="Product preview">
          <div className="landing__mock">
            <div className="landing__mock-sidebar" />
            <div className="landing__mock-body">
              <div className="landing__mock-stats">
                <span />
                <span />
                <span />
              </div>
              <div className="landing__mock-card">
                <div className="landing__mock-card-h" />
                <div className="landing__mock-card-row" />
                <div className="landing__mock-card-row" />
                <div className="landing__mock-btn" />
              </div>
            </div>
          </div>
          <ul className="landing__features">
            <li>Dashboard with live task counts</li>
            <li>Per-event participants and assignments</li>
            <li>Activity feed and CSV export</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
