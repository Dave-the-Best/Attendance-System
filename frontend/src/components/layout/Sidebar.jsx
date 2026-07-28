import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Clock, CalendarDays, ShieldCheck, Clock4, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/leave', label: 'Leave', icon: CalendarDays },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const items = [...NAV];
  if (user?.role === 'admin') items.push({ to: '/admin', label: 'Admin Console', icon: ShieldCheck });

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-logo">
          <Clock4 size={22} />
        </span>
        {!collapsed && (
          <span className="brand-text">
            Attend<span className="g">Pro</span>
          </span>
        )}
      </div>

      <nav className="side-nav">
        {!collapsed && <div className="side-section">Menu</div>}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId="side-active" className="side-active-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                )}
                <item.icon size={20} className="side-icon" />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className="side-collapse-btn" onClick={onToggleCollapse}>
          {collapsed ? <PanelLeft size={18} /> : <><PanelLeftClose size={18} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
