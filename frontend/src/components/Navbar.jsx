import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  if (!user) return null;

  const link = (to, label) => (
    <Link
      to={to}
      className={`nav-link ${loc.pathname === to ? 'active' : ''}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/dashboard" className="brand">
          <span className="brand-icon">🕐</span> AttendPro
        </Link>
        <div className="nav-links">
          {link('/dashboard', 'Dashboard')}
          {link('/attendance', 'Attendance')}
          {link('/leave', 'Leave')}
          {user.role === 'admin' && link('/admin', 'Admin')}
        </div>
        <div className="nav-right">
          <NotificationBell />
          <div className="user-chip">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
