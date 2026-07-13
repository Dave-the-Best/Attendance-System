import { gql, useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

const ME_DATA = gql`
  query {
    todayAttendance { id checkIn checkOut hoursWorked status }
    myLeaves { id type status startDate endDate }
    myAttendance { id date checkIn checkOut hoursWorked status }
  }
`;

const fmt = (d) => (d ? new Date(Number(d) || d).toLocaleTimeString() : '—');

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useQuery(ME_DATA, { pollInterval: 30000 });

  if (loading) return <div className="page"><div className="loader">Loading…</div></div>;

  const today = data?.todayAttendance;
  const leaves = data?.myLeaves || [];
  const history = (data?.myAttendance || []).slice(0, 7);
  const pending = leaves.filter((l) => l.status === 'pending').length;
  const approved = leaves.filter((l) => l.status === 'approved').length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">Here's what's happening today.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Today's Status"
          value={today?.checkIn ? (today.checkOut ? 'Completed' : 'Working') : 'Not checked in'}
          tone={today?.checkIn ? (today.checkOut ? 'ok' : 'warn') : 'idle'} />
        <StatCard label="Check-in Time" value={fmt(today?.checkIn)} tone="info" />
        <StatCard label="Hours Today" value={today?.hoursWorked ? `${today.hoursWorked}h` : '—'} tone="info" />
        <StatCard label="Pending Leaves" value={pending} tone={pending ? 'warn' : 'ok'} />
        <StatCard label="Approved Leaves" value={approved} tone="ok" />
        <StatCard label="Department" value={user.department || '—'} tone="idle" />
      </div>

      <div className="card">
        <h3>Recent Attendance</h3>
        {history.length === 0 ? (
          <div className="empty">No attendance records yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{fmt(a.checkIn)}</td>
                  <td>{fmt(a.checkOut)}</td>
                  <td>{a.hoursWorked || 0}h</td>
                  <td><span className={`pill pill-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ label, value, tone = 'idle' }) => (
  <div className={`stat stat-${tone}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);
