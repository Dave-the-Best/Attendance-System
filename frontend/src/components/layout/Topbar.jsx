import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials } from '../../lib/format';
import NotificationBell from '../NotificationBell';

const TITLES = {
  '/dashboard': { t: 'Dashboard', s: 'Overview of your day' },
  '/attendance': { t: 'Attendance', s: 'Track your work hours' },
  '/leave': { t: 'Leave', s: 'Request and manage time off' },
  '/admin': { t: 'Admin Console', s: 'Manage your organization' },
};

export default function Topbar({ onOpenMobile }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const loc = useLocation();
  const meta = TITLES[loc.pathname] || { t: 'AttendPro', s: '' };

  return (
    <header className="topbar">
      <button className="icon-btn mobile-toggle" onClick={onOpenMobile} aria-label="Open menu">
        <Menu size={19} />
      </button>
      <div>
        <div className="topbar-title">{meta.t}</div>
        {meta.s && <div className="topbar-sub">{meta.s}</div>}
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <NotificationBell />
        <div className="user-chip">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="user-meta">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button
          className="icon-btn"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
