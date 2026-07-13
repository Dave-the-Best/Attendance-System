import { gql, useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';

const DATA = gql`
  query {
    todayAttendance { id checkIn checkOut hoursWorked status }
    myAttendance { id date checkIn checkOut hoursWorked status }
  }
`;

const CHECK_IN = gql`mutation { checkIn { id checkIn status } }`;
const CHECK_OUT = gql`mutation { checkOut { id checkOut hoursWorked } }`;

const fmt = (d) => (d ? new Date(Number(d) || d).toLocaleTimeString() : '—');

export default function Attendance() {
  const { data, refetch, loading } = useQuery(DATA);
  const [ci, { loading: ciL }] = useMutation(CHECK_IN);
  const [co, { loading: coL }] = useMutation(CHECK_OUT);

  const today = data?.todayAttendance;
  const list = data?.myAttendance || [];

  const doCheckIn = async () => {
    try { await ci(); await refetch(); toast.success('Checked in'); }
    catch (e) { toast.error(e.message); }
  };
  const doCheckOut = async () => {
    try { await co(); await refetch(); toast.success('Checked out'); }
    catch (e) { toast.error(e.message); }
  };

  if (loading) return <div className="page"><div className="loader">Loading…</div></div>;

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Attendance</h1><p className="muted">Track your daily work hours</p></div>
      </div>

      <div className="card clock-card">
        <div className="clock">
          <div className="clock-time">{new Date().toLocaleTimeString()}</div>
          <div className="clock-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="clock-actions">
          <div className="clock-info">
            <div><span className="muted">Check-in</span> <b>{fmt(today?.checkIn)}</b></div>
            <div><span className="muted">Check-out</span> <b>{fmt(today?.checkOut)}</b></div>
            <div><span className="muted">Hours</span> <b>{today?.hoursWorked || 0}h</b></div>
          </div>
          <div className="clock-btns">
            <button className="btn btn-primary" disabled={ciL || !!today?.checkIn} onClick={doCheckIn}>
              {today?.checkIn ? '✓ Checked In' : (ciL ? '…' : 'Check In')}
            </button>
            <button className="btn btn-danger" disabled={coL || !today?.checkIn || !!today?.checkOut} onClick={doCheckOut}>
              {today?.checkOut ? '✓ Checked Out' : (coL ? '…' : 'Check Out')}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Attendance History</h3>
        {list.length === 0 ? (
          <div className="empty">No records yet.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td><td>{fmt(a.checkIn)}</td><td>{fmt(a.checkOut)}</td>
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
