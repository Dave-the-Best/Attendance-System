import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarClock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket } from '../socket';
import { useAuth } from '../context/AuthContext';
import { useAppMotion } from '../lib/motion';

export default function NotificationBell() {
  const { user } = useAuth();
  const m = useAppMotion();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const push = (n) => {
      setNotifications((prev) => [{ ...n, id: `${Date.now()}-${Math.random()}`, at: new Date() }, ...prev].slice(0, 20));
      toast.success(n.message);
    };
    const onLeaveNew = (d) => push({ type: 'leave', message: d.message });
    const onLeaveReviewed = (d) => push({ type: 'leave', message: d.message });
    const onAttendance = (d) => { if (user?.role === 'admin') push({ type: 'attendance', message: d.message }); };
    socket.on('leave:new', onLeaveNew);
    socket.on('leave:reviewed', onLeaveReviewed);
    socket.on('attendance:update', onAttendance);
    return () => {
      socket.off('leave:new', onLeaveNew);
      socket.off('leave:reviewed', onLeaveReviewed);
      socket.off('attendance:update', onAttendance);
    };
  }, [user]);

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications" aria-expanded={open} aria-haspopup="true">
        <Bell size={18} />
        {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="bell-dropdown" role="menu" {...m.dropdown}>
            <div className="bell-header">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setNotifications([])}>Clear</button>
              )}
            </div>
            <div className="bell-scroll">
              {notifications.length === 0 ? (
                <div className="bell-empty">You're all caught up.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="bell-item">
                    <div className="bell-ico">
                      {n.type === 'attendance' ? <UserCheck size={15} /> : <CalendarClock size={15} />}
                    </div>
                    <div>
                      <div className="msg">{n.message}</div>
                      <div className="time">{n.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
