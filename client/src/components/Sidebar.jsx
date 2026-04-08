import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    if (path === '/view-events') {
      return location.pathname === '/view-events' || location.pathname.startsWith('/events/');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Logo size={32} className="sidebar-logo-icon" />
        <h1 className="sidebar-title">Event Task Manager</h1>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          type="button"
          className={`sidebar-nav-link ${isActive('/create-event') ? 'active' : ''}`}
          onClick={() => navigate('/create-event')}
        >
          ➕ Create Event
        </button>
        <button
          type="button"
          className={`sidebar-nav-link ${isActive('/view-events') ? 'active' : ''}`}
          onClick={() => navigate('/view-events')}
        >
          📋 View Events
        </button>
        <button
          type="button"
          className={`sidebar-nav-link ${isActive('/calendar') ? 'active' : ''}`}
          onClick={() => navigate('/calendar')}
        >
          📅 Calendar
        </button>
        <button
          type="button"
          className={`sidebar-nav-link ${isActive('/activity-logs') ? 'active' : ''}`}
          onClick={() => navigate('/activity-logs')}
        >
          📜 Activity logs
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <p className="sidebar-user-name">{user?.name || user?.email}</p>
          <p className="sidebar-user-email">{user?.email}</p>
        </div>
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
