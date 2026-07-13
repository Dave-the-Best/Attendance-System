import { useEffect, useState } from 'react';
import { getSocket } from '../socket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const push = (n) => {
      setNotifications((prev) => [{ ...n, id: Date.now() + Math.random() }, ...prev].slice(0, 20));
      toast.success(n.message);
    };

    const onLeaveNew = (d) => push({ type: 'leave', message: d.message });
    const onLeaveReviewed = (d) => push({ type: 'leave', message: d.message });
    const onAttendance = (d) => {
      if (user?.role === 'admin') push({ type: 'attendance', message: d.message });
    };

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
    <div className="bell-wrap">
      <button className="bell-btn" onClick={() => setOpen((o) => !o)}>
        🔔
        {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
      </button>
      {open && (
        <div className="bell-dropdown">
          <div className="bell-header">Notifications</div>
          {notifications.length === 0 ? (
            <div className="bell-empty">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bell-item">
                <span className="bell-dot" /> {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
