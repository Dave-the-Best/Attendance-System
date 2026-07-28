import { useEffect, useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { LogIn, LogOut, CalendarCheck, Clock, Timer, AlertTriangle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { fmtTime, isSameMonth } from '../lib/format';
import PageTransition from '../components/ui/PageTransition';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Pill from '../components/ui/Pill';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';

const DATA = gql`
  query {
    todayAttendance { id checkIn checkOut hoursWorked status }
    myAttendance { id date checkIn checkOut hoursWorked status }
  }
`;
const CHECK_IN = gql`mutation { checkIn { id checkIn status } }`;
const CHECK_OUT = gql`mutation { checkOut { id checkOut hoursWorked } }`;

export default function Attendance() {
  const { data, refetch, loading } = useQuery(DATA);
  const [ci, { loading: ciL }] = useMutation(CHECK_IN);
  const [co, { loading: coL }] = useMutation(CHECK_OUT);
  const [now, setNow] = useState(new Date());
  const [month, setMonth] = useState('all');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = data?.todayAttendance;
  const list = data?.myAttendance || [];
  const checkedIn = !!today?.checkIn;
  const checkedOut = !!today?.checkOut;

  const monthly = useMemo(() => {
    const m = list.filter((a) => isSameMonth(a.date));
    const hours = m.reduce((s, a) => s + (a.hoursWorked || 0), 0);
    const late = m.filter((a) => a.status === 'late').length;
    return {
      present: m.length,
      late,
      hours: Math.round(hours * 10) / 10,
      avg: m.length ? Math.round((hours / m.length) * 10) / 10 : 0,
    };
  }, [list]);

  const months = useMemo(() => {
    const set = new Set(list.map((a) => (a.date || '').slice(0, 7)).filter(Boolean));
    return [...set].sort().reverse();
  }, [list]);

  const filtered = month === 'all' ? list : list.filter((a) => (a.date || '').startsWith(month));

  const doCheckIn = async () => {
    try { await ci(); await refetch(); toast.success('Checked in'); }
    catch (e) { toast.error(e.message); }
  };
  const doCheckOut = async () => {
    try { await co(); await refetch(); toast.success('Checked out'); }
    catch (e) { toast.error(e.message); }
  };

  if (loading && !data) return <Loader />;

  return (
    <PageTransition>
      <div className="page-head">
        <div>
          <h1>Attendance</h1>
          <p className="muted">Clock in, clock out, and review your work hours.</p>
        </div>
      </div>

      <Card index={0} className="clock-card">
        <div>
          <div className="clock-time">{now.toLocaleTimeString()}</div>
          <div className="clock-date">
            {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="clock-stats">
            <div className="clock-stat"><div className="k">Check-in</div><div className="v">{fmtTime(today?.checkIn)}</div></div>
            <div className="clock-stat"><div className="k">Check-out</div><div className="v">{fmtTime(today?.checkOut)}</div></div>
            <div className="clock-stat"><div className="k">Hours</div><div className="v">{today?.hoursWorked || 0}h</div></div>
          </div>
        </div>
        <div className="clock-btns">
          <motion.button className="btn btn-success btn-lg" whileTap={{ scale: 0.98 }} disabled={ciL || checkedIn} onClick={doCheckIn}>
            <LogIn size={18} /> {checkedIn ? 'Checked In' : ciL ? '…' : 'Check In'}
          </motion.button>
          <motion.button className="btn btn-danger btn-lg" whileTap={{ scale: 0.98 }} disabled={coL || !checkedIn || checkedOut} onClick={doCheckOut}>
            <LogOut size={18} /> {checkedOut ? 'Checked Out' : coL ? '…' : 'Check Out'}
          </motion.button>
        </div>
      </Card>

      <div className="stat-grid" style={{ marginTop: 22 }}>
        <StatCard index={0} icon={CalendarCheck} tone="ok" label="Days Present" value={monthly.present} foot="This month" />
        <StatCard index={1} icon={Timer} tone="brand" label="Total Hours" value={monthly.hours} foot="This month" />
        <StatCard index={2} icon={Clock} tone="info" label="Avg Hours / Day" value={monthly.avg} foot="This month" />
        <StatCard index={3} icon={AlertTriangle} tone={monthly.late ? 'warn' : 'ok'} label="Late Arrivals" value={monthly.late} foot="This month" />
      </div>

      <Card
        index={1}
        title="Attendance History"
        icon={History}
        action={
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
            <option value="all">All time</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={History} title="No records for this period" hint="Try a different month or check in today." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="mono">{a.date}</td>
                    <td className="mono">{fmtTime(a.checkIn)}</td>
                    <td className="mono">{fmtTime(a.checkOut)}</td>
                    <td className="mono">{a.hoursWorked || 0}h</td>
                    <td><Pill status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
