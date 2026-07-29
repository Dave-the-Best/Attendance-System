import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Clock, CalendarDays, ShieldCheck, Clock4, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { springSoft } from '../../lib/motion';

// Role-aware navigation. Admins get an additional "Manage" section; the same
// permission is enforced server-side (the UI reflects it, never guards it).
const MAIN = [
  { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/attendance', key: 'nav.attendance', icon: Clock },
  { to: '/leave', key: 'nav.leave', icon: CalendarDays },
];
const ADMIN = [{ to: '/admin', key: 'nav.admin', icon: ShieldCheck }];

function NavItem({ item, label, collapsed, onCloseMobile }) {
  return (
    <NavLink
      to={item.to}
      onClick={onCloseMobile}
      className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="side-active" className="side-active-pill" transition={springSoft} />}
          <item.icon size={18} className="side-icon" />
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const { t } = useLang();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-logo"><Clock4 size={18} /></span>
        {!collapsed && <span className="brand-text">Attend<span className="g">Pro</span></span>}
      </div>

      <nav className="side-nav" aria-label="Primary">
        {!collapsed && <div className="side-section">{t('side.workspace')}</div>}
        {MAIN.map((item) => (
          <NavItem key={item.to} item={item} label={t(item.key)} collapsed={collapsed} onCloseMobile={onCloseMobile} />
        ))}

        {isAdmin && (
          <>
            {!collapsed && <div className="side-section">{t('side.manage')}</div>}
            {ADMIN.map((item) => (
              <NavItem key={item.to} item={item} label={t(item.key)} collapsed={collapsed} onCloseMobile={onCloseMobile} />
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-foot">
        <button className="side-collapse-btn" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : t('side.collapse')}>
          {collapsed ? <PanelLeft size={16} /> : <><PanelLeftClose size={16} /> {t('side.collapse')}</>}
        </button>
      </div>
    </aside>
  );
}
